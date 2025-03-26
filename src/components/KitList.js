/** @format */

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  TextField,
  Button,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  FormControl,
  InputLabel,
  Alert,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Search as SearchIcon,
  BuildCircle as BuildIcon,
  Warning as WarningIcon,
  Business as BusinessIcon,
  Send as SendIcon,
  AssignmentReturn as CollectIcon,
} from "@mui/icons-material";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import moment from "moment";
import { kitService, distributorService } from "../services/api";

function KitList() {
  const [searchKitId, setSearchKitId] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedDistributors, setSelectedDistributors] = useState([]);
  const [selectedKit, setSelectedKit] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorTimeout, setErrorTimeout] = useState(null);
  const [successTimeout, setSuccessTimeout] = useState(null);

  // Selection and distribute states
  const [selectedKits, setSelectedKits] = useState([]);
  const [distributeDialog, setDistributeDialog] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState("");
  const [distributeDate, setDistributeDate] = useState(moment());
  const [distributors, setDistributors] = useState([]);
  const [distributorLoading, setDistributorLoading] = useState(false);

  // Collection states
  const [collectDialog, setCollectDialog] = useState(false);
  const [collectKits, setCollectKits] = useState([]);
  const [collectDate, setCollectDate] = useState(moment());

  // 组件卸载时清除timeout
  useEffect(() => {
    return () => {
      if (errorTimeout) {
        clearTimeout(errorTimeout);
      }
      if (successTimeout) {
        clearTimeout(successTimeout);
      }
    };
  }, [errorTimeout, successTimeout]);

  // Load initial data
  useEffect(() => {
    fetchKits();
    fetchDistributors();
  }, []);

  const fetchKits = async () => {
    try {
      setLoading(true);
      const data = await kitService.getAllKits();
      console.log("获取到的所有Kits:", data);

      // 确保每个kit有唯一的id且格式一致
      const processedData = data.map((kit) => ({
        ...kit,
        id: String(kit.id), // 确保id为字符串
      }));

      // 显示所有状态的套件，但确保格式化和ID处理正确
      setFilteredData(processedData);
    } catch (error) {
      setErrorWithTimeout(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDistributors = async () => {
    try {
      setDistributorLoading(true);
      const data = await distributorService.getAllDistributors();
      setDistributors(data || []);
    } catch (error) {
      console.error("Error fetching distributors:", error);
    } finally {
      setDistributorLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);

      let results = [];

      // Apply filters based on selected criteria
      if (startDate || endDate) {
        results = await kitService.getKitsByDateRange(
          startDate?.format("YYYY-MM-DD"),
          endDate?.format("YYYY-MM-DD")
        );
      } else if (searchStatus) {
        results = await kitService.getKitsByStatus(searchStatus);
      } else if (selectedDistributors.length > 0) {
        results = await kitService.getKitsByDistributorIds(
          selectedDistributors
        );
      } else {
        results = await kitService.getAllKits();
      }

      // Apply local filtering for Kit ID if provided
      if (searchKitId) {
        results = results.filter((kit) =>
          kit.id.toLowerCase().includes(searchKitId.toLowerCase())
        );
      }

      setFilteredData(results);
    } catch (error) {
      setErrorWithTimeout(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDistributeDialogOpen = () => {
    console.log("Selected kits for distribution:", selectedKits);

    if (!selectedKits || selectedKits.length === 0) {
      setErrorWithTimeout("Please select at least one kit to distribute");
      return;
    }

    // 确保所有选中的kit都存在于数据中
    const validKitIds = selectedKits.filter((kitId) =>
      filteredData.some((kit) => String(kit.id) === String(kitId))
    );

    if (validKitIds.length === 0) {
      setErrorWithTimeout("No valid kits selected");
      return;
    }

    // 只允许分发Available状态的套件
    const availableKits = validKitIds.filter((kitId) => {
      const kit = filteredData.find((k) => String(k.id) === String(kitId));
      return kit && (kit.status === "Available" || kit.status === "available");
    });

    // 检查是否有不可分发的套件被选中
    if (availableKits.length !== validKitIds.length) {
      setErrorWithTimeout(
        "Only Available kits can be distributed. Please deselect unavailable kits."
      );
      return;
    }

    setDistributeDialog(true);
  };

  const handleDistribute = async () => {
    if (!selectedDistributor) {
      setErrorWithTimeout("Please select a distributor");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 确保所有ID都是字符串
      const kitIdsToDistribute = selectedKits.map((id) => String(id));

      // 最后再次验证所有选中的kit是否处于可分发状态
      const allAvailable = kitIdsToDistribute.every((kitId) => {
        const kit = filteredData.find((k) => String(k.id) === kitId);
        return (
          kit && (kit.status === "Available" || kit.status === "available")
        );
      });

      if (!allAvailable) {
        setErrorWithTimeout(
          "Some selected kits are not in Available status. Distribution canceled."
        );
        setLoading(false);
        return;
      }

      // 日期格式化为ISO字符串或者不传递
      let formattedDate = undefined;
      if (distributeDate) {
        formattedDate = distributeDate.toISOString();
        console.log("格式化后的日期:", formattedDate);
      }

      console.log("准备分发套件:", {
        kit_ids: kitIdsToDistribute,
        distributor_id: selectedDistributor,
        distribute_date: formattedDate || "current time",
      });

      // 创建请求数据对象
      const requestData = {
        kit_ids: kitIdsToDistribute,
        distributor_id: selectedDistributor,
        distribute_date: formattedDate,
      };

      // 直接使用API调用
      const result = await kitService.distributeKits(requestData);
      console.log("分发结果:", result);

      if (result && result.message) {
        setSuccessMessageWithTimeout(
          result.message || "Kits distributed successfully"
        );
        setSelectedKits([]);
        setSelectedDistributor("");
        setDistributeDialog(false);

        // Refresh kits list
        await fetchKits();
      } else {
        // 处理API返回但没有提供message的情况
        setErrorWithTimeout(
          "Distribution completed but no confirmation message received"
        );
      }
    } catch (error) {
      console.error("分发kit时出错:", error);
      setErrorWithTimeout(error.message || "Failed to distribute kits");
    } finally {
      setLoading(false);
    }
  };

  const handleCollectDialogOpen = (kit) => {
    // 检查kit状态是否允许收集
    if (kit.status !== "In-use") {
      setErrorWithTimeout(
        `Kit ${kit.id} cannot be collected. Only In-use kits can be collected.`
      );
      return;
    }

    setCollectKits([kit.id]);
    setCollectDialog(true);
  };

  const handleCollect = async () => {
    try {
      setLoading(true);
      setError(null);

      // 最后再次验证所有选中的kit是否处于可收集状态
      const allInUse = collectKits.every((kitId) => {
        const kit = filteredData.find((k) => String(k.id) === String(kitId));
        return kit && kit.status === "In-use";
      });

      if (!allInUse) {
        setErrorWithTimeout(
          "Some selected kits are not in In-use status. Collection canceled."
        );
        setLoading(false);
        return;
      }

      console.log("准备收集套件:", {
        kit_ids: collectKits,
        end_time: collectDate.toISOString(),
      });

      const result = await kitService.collectKits({
        kit_ids: collectKits,
        end_time: collectDate.toISOString(),
      });

      if (result && result.message) {
        setSuccessMessageWithTimeout(
          result.message || "Kits collected successfully"
        );
        setCollectKits([]);
        setCollectDialog(false);

        // Refresh kits list
        await fetchKits();
      } else {
        setErrorWithTimeout(
          "Collection completed but no confirmation message received"
        );
      }
    } catch (error) {
      console.error("收集kit时出错:", error);
      setErrorWithTimeout(error.message || "Failed to collect kits");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "id", headerName: "Kit ID", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            color:
              params.value === "Available" || params.value === "available"
                ? "success.main"
                : params.value === "Bound" || params.value === "In-use"
                ? "info.main"
                : params.value === "Used"
                ? "secondary.main"
                : params.value === "Unavailable"
                ? "warning.main"
                : "error.main",
          }}
        >
          {params.value === "Available" || params.value === "available" ? (
            <BuildIcon sx={{ mr: 1 }} />
          ) : params.value === "Bound" || params.value === "In-use" ? (
            <BusinessIcon sx={{ mr: 1 }} />
          ) : params.value === "Used" ? (
            <CollectIcon sx={{ mr: 1 }} />
          ) : (
            <WarningIcon sx={{ mr: 1 }} />
          )}
          {params.value}
        </Box>
      ),
    },
    {
      field: "distributor_name",
      headerName: "Distributor",
      flex: 1,
      renderCell: (params) => {
        console.log("渲染分发商信息:", params.row);

        // 检查多种可能的字段名
        if (
          params.row.status === "Bound" ||
          params.row.status === "In-use" ||
          params.row.status === "Used"
        ) {
          // 首先尝试distributor_name，如果为空则尝试distributor对象的name属性
          // 如果这两个都不存在，则尝试distributor字段(它可能是直接存储的字符串)
          const distributorValue =
            params.row.distributor_name ||
            (params.row.distributor &&
            typeof params.row.distributor === "object"
              ? params.row.distributor.name
              : params.row.distributor);

          // 为"Used"状态添加标记
          if (params.row.status === "Used" && distributorValue) {
            return (
              <Box sx={{ display: "flex", alignItems: "center", opacity: 0.7 }}>
                <span>{distributorValue}</span>
                <span style={{ marginLeft: "4px", fontSize: "0.75rem" }}>
                  (收集完成)
                </span>
              </Box>
            );
          }

          return distributorValue || "-";
        }
        return "-";
      },
    },
    {
      field: "created_at",
      headerName: "Create Time",
      flex: 1,
      valueFormatter: (params) => {
        if (!params) return "-";
        try {
          return moment(params).format("YYYY-MM-DD HH:mm:ss");
        } catch (error) {
          console.error("Date parsing error:", error);
          return params.value;
        }
      },
    },
    {
      field: "dispense_date",
      headerName: "Distribute Date",
      flex: 1,
      renderCell: (params) => {
        console.log("渲染分发日期信息:", params.row);

        // 首先尝试从dispense_date字段获取
        let dateValue = params.row.dispense_date;

        // 如果没有dispense_date，尝试其他可能的字段
        if (!dateValue) {
          dateValue = params.row.start_time || params.row.distribute_date;
        }

        // 如果状态是"In-use"或"Used"但没有找到日期，尝试使用created_at作为后备
        if (
          !dateValue &&
          (params.row.status === "In-use" ||
            params.row.status === "Bound" ||
            params.row.status === "Used")
        ) {
          dateValue = params.row.created_at;
        }

        if (!dateValue) return "-";

        try {
          let formattedDate = moment(dateValue).format("YYYY-MM-DD HH:mm:ss");

          // 为"Used"状态添加额外的样式
          if (params.row.status === "Used") {
            return <Box sx={{ opacity: 0.7 }}>{formattedDate}</Box>;
          }

          return formattedDate;
        } catch (error) {
          console.error("日期格式化错误:", error);
          return "-";
        }
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => {
        const isAvailable =
          params.row.status === "Available" ||
          params.row.status === "available";

        const isInUse = params.row.status === "In-use";

        const isUsed = params.row.status === "Used";

        // 统一按钮样式和大小
        const buttonStyle = { minWidth: "110px" };

        if (isAvailable || isUsed) {
          return (
            <Button
              variant="contained"
              color="secondary"
              size="small"
              onClick={() => handleDissemble(params.row)}
              startIcon={<BuildIcon />}
              sx={buttonStyle}
            >
              Dissemble
            </Button>
          );
        } else if (isInUse) {
          return (
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => handleCollectDialogOpen(params.row)}
              startIcon={<CollectIcon />}
              sx={buttonStyle}
            >
              Collect
            </Button>
          );
        }

        return null;
      },
    },
  ];

  const handleDissemble = (kit) => {
    // 检查kit状态是否允许拆解
    if (
      kit.status !== "Available" &&
      kit.status !== "available" &&
      kit.status !== "Used"
    ) {
      setErrorWithTimeout(
        `Kit ${kit.id} cannot be dissembled. Only Available and Used kits can be dissembled.`
      );
      return;
    }

    setSelectedKit(kit);
    setConfirmDialog(true);
  };

  const confirmDissemble = async () => {
    try {
      setLoading(true);

      // 处理批量拆解
      if (selectedKit?.batchDissemble && selectedKit.batchIds?.length > 0) {
        let successCount = 0;
        let failedCount = 0;

        // 最后再次验证所有kit的状态
        const invalidKits = selectedKit.batchIds.filter((kitId) => {
          const kit = filteredData.find((k) => String(k.id) === String(kitId));
          return (
            !kit ||
            (kit.status !== "Available" &&
              kit.status !== "available" &&
              kit.status !== "Used")
          );
        });

        if (invalidKits.length > 0) {
          setErrorWithTimeout(
            `Some selected kits (${invalidKits.length}) are not in valid status for dissembling.`
          );
          setLoading(false);
          setConfirmDialog(false);
          setSelectedKit(null);
          return;
        }

        // 逐个拆解所有选中的套件
        for (const kitId of selectedKit.batchIds) {
          try {
            const result = await kitService.disassembleKit(kitId);
            if (result.message === "Kit disassembled successfully") {
              successCount++;
            } else {
              failedCount++;
            }
          } catch (error) {
            console.error(`Error dissembling kit ${kitId}:`, error);
            failedCount++;
          }
        }

        if (successCount > 0) {
          setSuccessMessageWithTimeout(
            `Successfully disassembled ${successCount} kit${
              successCount !== 1 ? "s" : ""
            }${failedCount > 0 ? ` (${failedCount} failed)` : ""}`
          );
        } else {
          setErrorWithTimeout(`Failed to disassemble any kits`);
        }
      }
      // 处理单个拆解
      else {
        const result = await kitService.disassembleKit(selectedKit.id);
        if (result.message === "Kit disassembled successfully") {
          setSuccessMessageWithTimeout("Kit disassembled successfully");
        }
      }

      // Refresh the kit list
      fetchKits();
    } catch (error) {
      setErrorWithTimeout(error.message);
    } finally {
      setLoading(false);
      setConfirmDialog(false);
      setSelectedKit(null);
    }
  };

  const setErrorWithTimeout = (errorMessage) => {
    // 清除已存在的timeout
    if (errorTimeout) {
      clearTimeout(errorTimeout);
    }

    // 设置错误信息
    setError(errorMessage);

    // 设置新的timeout，5秒后自动清除错误
    const timeout = setTimeout(() => {
      setError(null);
    }, 5000);

    setErrorTimeout(timeout);
  };

  const setSuccessMessageWithTimeout = (message) => {
    // 清除已存在的timeout
    if (successTimeout) {
      clearTimeout(successTimeout);
    }

    // 设置成功信息
    setSuccessMessage(message);

    // 设置新的timeout，5秒后自动清除成功消息
    const timeout = setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);

    setSuccessTimeout(timeout);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h4">Kit Management</Typography>
        </Box>

        <Card sx={{ p: 2, mb: 3 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems="flex-start"
          >
            <TextField
              label="Search Kit ID"
              variant="outlined"
              size="small"
              value={searchKitId}
              onChange={(e) => setSearchKitId(e.target.value)}
              InputProps={{
                endAdornment: <SearchIcon color="action" />,
              }}
            />
            <TextField
              label="Status"
              variant="outlined"
              size="small"
              value={searchStatus}
              onChange={(e) => setSearchStatus(e.target.value)}
            />
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              slotProps={{ textField: { size: "small" } }}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              slotProps={{ textField: { size: "small" } }}
            />
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel>Distributors</InputLabel>
              <Select
                multiple
                value={selectedDistributors}
                onChange={(e) => setSelectedDistributors(e.target.value)}
                input={<OutlinedInput label="Distributors" />}
                renderValue={(selected) =>
                  selected
                    .map((id) => distributors.find((d) => d.id === id)?.name)
                    .join(", ")
                }
              >
                {distributors.map((distributor) => (
                  <MenuItem key={distributor.id} value={distributor.id}>
                    <Checkbox
                      checked={
                        selectedDistributors.indexOf(distributor.id) > -1
                      }
                    />
                    <ListItemText primary={distributor.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleSearch}
              startIcon={<SearchIcon />}
              sx={{ height: 40 }}
            >
              Search
            </Button>
          </Stack>
        </Card>

        {/* Action buttons toolbar */}
        <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SendIcon />}
              onClick={handleDistributeDialogOpen}
              disabled={selectedKits.length === 0}
            >
              Distribute Kits
            </Button>

            {/* Batch collect button */}
            <Button
              variant="contained"
              color="secondary"
              startIcon={<CollectIcon />}
              onClick={() => {
                // 过滤出In-use状态的套件
                const inUseKits = selectedKits.filter((kitId) => {
                  const kit = filteredData.find(
                    (k) => String(k.id) === String(kitId)
                  );
                  return kit && kit.status === "In-use";
                });

                // 如果没有In-use状态的套件被选中
                if (inUseKits.length === 0) {
                  setErrorWithTimeout(
                    "Please select at least one In-use kit to collect"
                  );
                  return;
                }

                // 检查是否选择了错误状态的套件
                if (inUseKits.length !== selectedKits.length) {
                  setErrorWithTimeout(
                    "Only In-use kits can be collected. Please deselect other kits."
                  );
                  return;
                }

                setCollectKits(inUseKits);
                setCollectDialog(true);
              }}
              disabled={selectedKits.length === 0}
            >
              Collect Selected Kits
            </Button>

            {/* Batch dissemble button */}
            <Button
              variant="contained"
              color="error"
              startIcon={<BuildIcon />}
              onClick={() => {
                // 过滤出可拆解状态的套件(Available或Used)
                const dissembleKits = selectedKits.filter((kitId) => {
                  const kit = filteredData.find(
                    (k) => String(k.id) === String(kitId)
                  );
                  return (
                    kit &&
                    (kit.status === "Used" ||
                      kit.status === "Available" ||
                      kit.status === "available")
                  );
                });

                if (dissembleKits.length === 0) {
                  setErrorWithTimeout(
                    "Please select at least one Used or Available kit to dissemble"
                  );
                  return;
                }

                // 检查是否选择了错误状态的套件
                if (dissembleKits.length !== selectedKits.length) {
                  setErrorWithTimeout(
                    "Only Available and Used kits can be dissembled. Please deselect other kits."
                  );
                  return;
                }

                // 创建确认对话框文本
                const confirmMessage = `Are you sure you want to dissemble ${
                  dissembleKits.length
                } kit${dissembleKits.length !== 1 ? "s" : ""}?`;

                // 设置要拆解的套件
                setSelectedKit({
                  id: dissembleKits[0],
                  batchDissemble: true,
                  batchIds: dissembleKits,
                  confirmMessage,
                });

                setConfirmDialog(true);
              }}
              disabled={selectedKits.length === 0}
            >
              Dissemble Selected Kits
            </Button>
          </Box>

          {selectedKits.length > 0 && (
            <Typography variant="body2" sx={{ alignSelf: "center" }}>
              {selectedKits.length} kit{selectedKits.length !== 1 ? "s" : ""}{" "}
              selected
            </Typography>
          )}
        </Box>

        <Card sx={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={filteredData}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 25]}
            checkboxSelection
            disableSelectionOnClick
            loading={loading}
            onRowSelectionModelChange={(newSelection) => {
              console.log("Selection changed:", newSelection);
              setSelectedKits(newSelection);
            }}
            rowSelectionModel={selectedKits}
            isRowSelectable={(params) => {
              return (
                params.row.status === "Available" ||
                params.row.status === "available" ||
                params.row.status === "In-use" ||
                params.row.status === "Used"
              );
            }}
            sx={{
              "& .MuiDataGrid-cell:focus": {
                outline: "none",
              },
            }}
          />
        </Card>

        {error && (
          <Alert
            severity="error"
            sx={{ mt: 2 }}
            onClose={() => {
              setError(null);
              if (errorTimeout) {
                clearTimeout(errorTimeout);
                setErrorTimeout(null);
              }
            }}
          >
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert
            severity="success"
            sx={{ mt: 2 }}
            onClose={() => {
              setSuccessMessage(null);
              if (successTimeout) {
                clearTimeout(successTimeout);
                setSuccessTimeout(null);
              }
            }}
          >
            {successMessage}
          </Alert>
        )}

        {/* Dialogs */}
        <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
          <DialogTitle>Confirm Dissemble</DialogTitle>
          <DialogContent>
            {selectedKit?.batchDissemble
              ? selectedKit.confirmMessage
              : `Are you sure you want to dissemble Kit ${selectedKit?.id}?`}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialog(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={confirmDissemble}
              variant="contained"
              color="secondary"
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm"}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={distributeDialog}
          onClose={() => !loading && setDistributeDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Distribute Kits</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, pb: 1 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                You are about to distribute {selectedKits.length} kit
                {selectedKits.length !== 1 ? "s" : ""}.
              </Typography>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="distributor-label">Distributor</InputLabel>
                <Select
                  labelId="distributor-label"
                  value={selectedDistributor}
                  onChange={(e) => setSelectedDistributor(e.target.value)}
                  label="Distributor"
                  disabled={loading || distributorLoading}
                >
                  {distributors.map((distributor) => (
                    <MenuItem key={distributor.id} value={distributor.id}>
                      {distributor.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <DatePicker
                label="Distribute Date (optional)"
                value={distributeDate}
                onChange={setDistributeDate}
                disabled={loading}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText:
                      "If not specified, current date and time will be used",
                  },
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDistributeDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDistribute}
              variant="contained"
              color="primary"
              disabled={loading || !selectedDistributor}
            >
              {loading ? "Processing..." : "Distribute"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Collect Dialog */}
        <Dialog
          open={collectDialog}
          onClose={() => !loading && setCollectDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Collect Kits</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, pb: 1 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                You are about to collect {collectKits.length} kit
                {collectKits.length !== 1 ? "s" : ""} from the distributor.
              </Typography>

              <DatePicker
                label="Collection Date (End Time)"
                value={collectDate}
                onChange={setCollectDate}
                disabled={loading}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText:
                      "If not specified, current date and time will be used",
                  },
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCollectDialog(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleCollect}
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? "Processing..." : "Collect"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}

export default KitList;

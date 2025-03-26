/** @format */

import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const kitService = {
  // Get all kits
  getAllKits: async () => {
    try {
      const response = await api.get("/kits/getAll");
      console.log("后端返回的原始Kit数据:", response.data);

      return response.data.map((kit) => ({
        ...kit,
        // 处理分发商信息：优先级为distributor_name > distributor.name > distributor(字符串)
        distributor_name:
          kit.distributor_name ||
          (kit.distributor && typeof kit.distributor === "object"
            ? kit.distributor.name
            : kit.distributor),
        // 确保所有日期字段都有值或为null
        created_at: kit.created_at || null,
        // 处理可能的不同日期字段名
        dispense_date: kit.dispense_date || kit.start_time || null,
        // 确保状态字段的大小写一致
        status: kit.status || "Unknown",
      }));
    } catch (error) {
      throw kitService.handleError(error);
    }
  },

  // Get kit by ID
  getKitById: async (kitId) => {
    try {
      const response = await api.get(`/kits/${kitId}`);
      return response.data;
    } catch (error) {
      throw kitService.handleError(error);
    }
  },

  // Get kits by date range
  getKitsByDateRange: async (startDate, endDate) => {
    try {
      const response = await api.get("/kits/filterByCreatedAtRange", {
        params: {
          startDate,
          endDate,
        },
      });
      return response.data;
    } catch (error) {
      throw kitService.handleError(error);
    }
  },

  // Get kits by status
  getKitsByStatus: async (status) => {
    try {
      const response = await api.get("/kits/filterByStatus", {
        params: { status },
      });
      return response.data;
    } catch (error) {
      throw kitService.handleError(error);
    }
  },

  // Get kits by distributor IDs
  getKitsByDistributorIds: async (distributorIds) => {
    try {
      const promises = distributorIds.map((id) =>
        api.get("/kits/filterByDistributorId", {
          params: { distributorId: id },
        })
      );
      const responses = await Promise.all(promises);
      return responses.flatMap((response) => response.data);
    } catch (error) {
      throw kitService.handleError(error);
    }
  },

  // Create a new kit
  createKit: async (components) => {
    try {
      const response = await api.post("/kits/create", {
        phone_ID: components.phone?.id,
        SIM_card_ID: components.simCard?.id,
        right_sensor_ID: components.rightSensor?.id,
        left_sensor_ID: components.leftSensor?.id,
        headphones_ID: components.headphone?.id,
      });
      return response.data;
    } catch (error) {
      throw kitService.handleError(error);
    }
  },

  // Disassemble a kit
  disassembleKit: async (kitId) => {
    try {
      const response = await api.post("/kits/disassemble", {
        kit_ID: kitId,
      });
      return response.data;
    } catch (error) {
      throw kitService.handleError(error);
    }
  },

  // Change kit status
  changeKitStatus: async (kitId, status) => {
    try {
      const response = await api.post("/kits/satus_change", {
        kit_id: kitId,
        status: status,
      });
      return response.data;
    } catch (error) {
      throw kitService.handleError(error);
    }
  },

  // Get all components
  getAllComponents: async () => {
    try {
      const response = await api.get("/components");
      // Convert the component type to a format used by the frontend
      const typeMapping = {
        Phone: "phone",
        SimCard: "simCard",
        RightSensor: "rightSensor",
        LeftSensor: "leftSensor",
        Headphone: "headphone",
      };

      return response.data.components.map((component) => ({
        ...component,
        type: typeMapping[component.type] || component.type.toLowerCase(),
        //Ensure the date field format is correct
        created_at: component.created_at || null,
        discarded_at: component.discarded_at || null,
      }));
    } catch (error) {
      throw kitService.handleError(error);
    }
  },

  // Create components by batch
  createComponentsByBatch: async (componentType, data) => {
    try {
      const response = await api.post(`/${componentType}/createByBatch`, data);
      return response.data;
    } catch (error) {
      throw kitService.handleError(error);
    }
  },

  // Get components by batch number
  getComponentsByBatchNumber: async (batchNumber) => {
    try {
      const response = await api.get(`/components/batch_query/${batchNumber}`);
      // Format component types to match frontend conventions
      const typeMapping = {
        Phone: "phone",
        SimCard: "simCard",
        RightSensor: "rightSensor",
        LeftSensor: "leftSensor",
        Headphone: "headphone",
        Box: "box",
      };

      return {
        ...response.data,
        components: response.data.components.map((component) => ({
          ...component,
          type: typeMapping[component.type] || component.type.toLowerCase(),
        })),
      };
    } catch (error) {
      throw kitService.handleError(error);
    }
  },

  // Get component usage history
  getComponentUsageHistory: async (componentId) => {
    try {
      const response = await api.get(`/usage/component/${componentId}`);
      return response.data;
    } catch (error) {
      throw kitService.handleError(error);
    }
  },

  // Update component status
  updateComponentStatus: async (componentId, status) => {
    try {
      const response = await api.put(
        `/components/status_update/${componentId}`,
        {
          status: status,
        }
      );
      return response.data;
    } catch (error) {
      throw kitService.handleError(error);
    }
  },

  // Distribute kits to a distributor
  distributeKits: async (distributeData) => {
    try {
      console.log("Calling API to distribute kits:", distributeData);

      // 转换参数名称以匹配后端期望的格式
      const backendData = {
        kits: distributeData.kit_ids, // 修改为'kits'
        distributor_id: distributeData.distributor_id,
        // 如果有日期，转换为ISO 8601格式
        start_time: distributeData.distribute_date
          ? new Date(distributeData.distribute_date).toISOString()
          : undefined,
      };

      console.log("转换后的请求数据:", backendData);

      const response = await api.post("/kits/distribute", backendData);
      console.log("API distribute response:", response);

      // 如果分发成功，更新本地Kit数据以正确显示分发商和分发日期
      if (response.data && response.status === 200) {
        // 可以选择在这里重新获取所有Kit数据
        console.log("分发成功，开始获取更新后的Kit数据");
      }

      return response.data;
    } catch (error) {
      console.error("Error in distributeKits API call:", error);
      if (error.response) {
        console.error("Response error data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      throw kitService.handleError(error);
    }
  },

  // Collect kits from distributor
  collectKits: async (collectData) => {
    try {
      console.log("Calling API to collect kits:", collectData);

      // 转换参数名称以匹配后端期望的格式
      const backendData = {
        kits: collectData.kit_ids, // 确保使用kits作为参数名
        endTime: collectData.end_time // 确保使用endTime作为参数名
          ? new Date(collectData.end_time).toISOString()
          : undefined,
      };

      console.log("转换后的请求数据:", backendData);

      const response = await api.patch("/kits/collect", backendData);
      console.log("API collect response:", response);

      return response.data;
    } catch (error) {
      console.error("Error in collectKits API call:", error);
      if (error.response) {
        console.error("Response error data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      throw kitService.handleError(error);
    }
  },

  // Helper method to handle errors
  handleError: (error) => {
    if (error.response) {
      // Server responded with error
      return {
        message: error.response.data.message || "An error occurred",
        details: error.response.data.details,
        status: error.response.status,
      };
    }
    // Network error or other issues
    return {
      message: "Network error occurred",
      details: error.message,
      status: 500,
    };
  },
};

export const distributorService = {
  // Get all distributors
  getAllDistributors: async () => {
    try {
      const response = await api.get("/distributors");
      return response.data;
    } catch (error) {
      throw distributorService.handleError(error);
    }
  },

  // Get distributor by ID
  getDistributorById: async (distributorId) => {
    try {
      const response = await api.get(`/distributors/${distributorId}`);
      return response.data;
    } catch (error) {
      throw distributorService.handleError(error);
    }
  },

  // Create distributor
  createDistributor: async (distributorData) => {
    try {
      const response = await api.post("/distributors", distributorData);
      return response.data;
    } catch (error) {
      throw distributorService.handleError(error);
    }
  },

  // Update distributor
  updateDistributor: async (distributorId, distributorData) => {
    try {
      const response = await api.put(
        `/distributors/${distributorId}`,
        distributorData
      );
      return response.data;
    } catch (error) {
      throw distributorService.handleError(error);
    }
  },

  // Update distributor status
  updateDistributorStatus: async (distributorId, status) => {
    try {
      const response = await api.patch(
        `/distributors/${distributorId}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      throw distributorService.handleError(error);
    }
  },

  // Helper method to handle errors
  handleError: (error) => {
    if (error.response) {
      // Server responded with error
      return {
        message: error.response.data.message || "An error occurred",
        details: error.response.data.details,
        status: error.response.status,
      };
    }
    // Network error or other issues
    return {
      message: "Network error occurred",
      details: error.message,
      status: 500,
    };
  },
};

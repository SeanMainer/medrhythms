/** @format */

// Interface for Kit data structure
export interface Kit {
  id: string;
  batchNumber: string;
  status: "available" | "dissembled" | "bound";
  createTime: string;
  distributor?: string;
  components: {
    headphone?: string;
    leftSensor?: string;
    rightSensor?: string;
    phone?: string;
    simCard?: string;
  };
}

// Interface for Component data structure
export interface Component {
  id: string;
  type: "headphone" | "leftSensor" | "rightSensor" | "phone" | "simCard";
  batchNumber: string;
  status: "available" | "used";
  createTime: string;
}

export interface Distributor {
  id: string;
  name: string;
  email: string;
  tel: string;
  address: string;
  city: string;
  contactPerson: string;
  status: "active" | "inactive";
  createdAt: string;
}

import axios from "axios";

let axiosOpts = {
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60 * 1000,
};

if (!process.env.production) {
  axiosOpts = {
    ...axiosOpts,
    withCredentials: true,
  };
}

class MockResponse {
  constructor(success, data) {
    this.success = success;
    this.data = data;
  }
}

class MockApi {
  constructor(axiosOpts) {
    this.axiosOpts = axiosOpts;
    this.bills = [];
  }

  parseBills(data) {
    const bill = data?.data?.bill;
    if (bill) {
      this.bills.push(bill);
    }
    return new MockResponse(true, null);
  }

  async post(url, data, config) {
    console.log(url, data, config);
    let result = null;
    switch (url) {
      case "/ParseBills":
        result = this.parseBills(data);
        break;
      default:
        throw ([url, data, config], "Method is not mocked");
    }
    return { data: { d: { ...{ bills: this.bills }, ...result } } };
  }
}

const API = process.env.production
  ? axios.create(axiosOpts)
  : new MockApi(axiosOpts);

export default API;

import client from "./client";

export const getDashboardMetrics = (days = 30) =>
  client.get("/dashboard/metrics/", { params: { days } });

export const getUserSegments = (params = {}) =>
  client.get("/users/segments/", { params });

export const getTopFeatures = (days = 30) =>
  client.get("/features/top/", { params: { days } });

export const createEvent = (data) => client.post("/events/", data);

export const getUsers = () => client.get("/users/");

export const createUser = (data) => client.post("/users/", data);

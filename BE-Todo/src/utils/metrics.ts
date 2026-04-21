import client from "prom-client";

// Collect default metrics
client.collectDefaultMetrics({
  labels: { app: "be-todo" },
});

export const metricsRegister = client.register;

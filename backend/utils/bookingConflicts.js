const Service = require("../models/Service");

// The spa is one private complex: only one group can use it at a time, so a booking for any spa
// service (personal treatments and packages) blocks every other spa service at that time.
// Services in the "other" category (e.g. the villa stay) are separate resources and only
// conflict with bookings of the same service.
const conflictServiceFilter = async (serviceId) => {
  const service = await Service.findById(serviceId).select("category").lean();
  if (!service || service.category === "other") {
    return { serviceId };
  }
  const spaServices = await Service.find({ category: { $ne: "other" } }).select("_id").lean();
  return { serviceId: { $in: spaServices.map((svc) => svc._id) } };
};

module.exports = { conflictServiceFilter };

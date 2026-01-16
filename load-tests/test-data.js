// Test data generator for load testing
module.exports = {
  generateRandomId,
  generateInspectionData,
  generateObservationData,
  generateIncidentData
};

function generateRandomId() {
  return Math.random().toString(36).substring(2, 15);
}

function generateInspectionData(context, events, done) {
  context.vars.inspectionId = generateRandomId();
  context.vars.projectName = `Project-${Math.floor(Math.random() * 1000)}`;
  context.vars.inspector = `Inspector-${Math.floor(Math.random() * 100)}`;
  return done();
}

function generateObservationData(context, events, done) {
  context.vars.observationId = generateRandomId();
  context.vars.location = `Site-${Math.floor(Math.random() * 50)}`;
  return done();
}

function generateIncidentData(context, events, done) {
  context.vars.incidentId = generateRandomId();
  context.vars.severity = ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)];
  return done();
}

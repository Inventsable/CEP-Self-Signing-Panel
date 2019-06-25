var console = {
  log: function(data) {
    JSXEvent(data, "console");
  }
};

// Thanks Davide Barranca
function JSXEvent(payload, eventType) {
  try {
    var xLib = new ExternalObject("lib:PlugPlugExternalObject");
  } catch (e) {
    JSXEvent(e, "console");
  }
  if (xLib) {
    var eventObj = new CSXSEvent();
    eventObj.type = eventType;
    eventObj.data = payload;
    eventObj.dispatch();
  }
  return;
}



function saveToFile(data, filename = "leads.json") {
   debugger
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}


(() => {
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    const url = args[0];
    const options = args[1] || {};

    if (typeof url === "string" && url.includes("/leads/list") && options.method === "POST") {
      const clone = response.clone();
      clone.json()
        .then(data => {
          console.log("%c[Leads API Response - fetch]", "color: green; font-weight: bold;");
          
        })
        .catch(err => console.error("[Error parsing fetch response]", err));
    }

    return response;
  };

  const originalXHR = window.XMLHttpRequest;
  const open = originalXHR.prototype.open;
  const send = originalXHR.prototype.send;

  originalXHR.prototype.open = function (method, url) {
    this._url = url;
    this._method = method;
    return open.apply(this, arguments);
  };

  originalXHR.prototype.send = function (body) {
  this._requestBody = body;  // 💾 Save request payload for later access

  this.addEventListener("load", function () {
    // ✅ Now you can access it here
    try {
      const parsedRequest = JSON.parse(this._requestBody);
      const tabName = parsedRequest.TabSelected || "DefaultTab";

        const responseText = this.responseText;
        const json = JSON.parse(responseText);
        console.log("[XHR Response]", json);

        if (json.leadDetail && Array.isArray(json.leadDetail)) {
          saveToFile(json.leadDetail, tabName);
        }
        
      
    } catch (err) {
      console.error("[XHR] Failed to parse request or response", err);
    }
  });
    return send.apply(this, arguments);
  };

  console.log("%c[Leads Monitor Activated]", "color: purple; font-weight: bold;");
})();

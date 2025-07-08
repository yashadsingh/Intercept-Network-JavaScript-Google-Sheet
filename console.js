
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxWHesWtOjssm0t6NDiXxxBKZqtty6Z2zjKEyD00koCvRwoyLz_yN3JSxMXpIfCuf_x/exec";

function sendToGoogleSheet(dataArray) {
   debugger;
  fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify(dataArray),
    headers: { "Content-Type": "application/json" }
  })
  .then(res => res.text())
  .then(msg => console.log("[Google Sheet]:", msg))
  .catch(console.error);
}

function saveToFile(data, filename = "leads.json") {
    debugger;
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

  originalXHR.prototype.send = function () {
    this.addEventListener("load", function () {
      if (this._url.includes("/leads/list") && this._method === "POST") {
        try {
          const responseText = this.responseText;
          const json = JSON.parse(responseText);
          console.log("%c[Leads API Response - XHR]", "color: blue; font-weight: bold;");          
          sendToGoogleSheet(json.leadDetail);
        } catch (err) {
          console.error("[Error parsing XHR response]", err);
        }
      }
    });
    return send.apply(this, arguments);
  };

  console.log("%c[Leads Monitor Activated]", "color: purple; font-weight: bold;");
})();



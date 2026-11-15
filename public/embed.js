/*! Stroke embeds: sizes <iframe data-stroke-embed> to its content. https://stroke.click */
(function () {
  if (window.__strokeEmbed) return;
  window.__strokeEmbed = true;
  window.addEventListener("message", function (e) {
    var d = e.data;
    if (!d || d.type !== "stroke:embed:height" || typeof d.height !== "number") return;
    // Only frames that opted in, and only the one that sent the message.
    var frames = document.querySelectorAll("iframe[data-stroke-embed]");
    for (var i = 0; i < frames.length; i++) {
      var f = frames[i];
      if (f.contentWindow === e.source) {
        var h = Math.max(120, Math.min(4000, Math.ceil(d.height)));
        f.style.height = h + "px";
        f.setAttribute("height", String(h));
      }
    }
  });
})();

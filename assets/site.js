// Indo Texnology site: menu, YouTube click-to-play, enquiry forms. No libraries.
(function () {
  // Mobile menu
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("open", !open);
    });
  }
  document.querySelectorAll(".sub-toggle").forEach(function (b) {
    b.addEventListener("click", function () {
      var open = b.getAttribute("aria-expanded") === "true";
      b.setAttribute("aria-expanded", String(!open));
      b.nextElementSibling.classList.toggle("open", !open);
    });
  });

  // YouTube: load the player only when someone clicks (keeps pages fast)
  document.querySelectorAll("button.yt").forEach(function (b) {
    b.addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + b.dataset.id + "?autoplay=1&rel=0";
      f.title = b.getAttribute("aria-label") || "Video";
      f.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
      f.allowFullscreen = true;
      var box = document.createElement("div");
      box.className = "yt";
      box.appendChild(f);
      b.replaceWith(box);
    });
  });

  // Enquiry, support and careers forms.
  // With an endpoint set in content.py the form posts there (e.g. Formspree).
  // Without one, it opens WhatsApp with the details already typed in.
  document.querySelectorAll("form.enquiry").forEach(function (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var status = form.querySelector(".form-status");
      var ok = true;
      form.querySelectorAll("[required]").forEach(function (f) {
        var bad = !f.value.trim();
        f.setAttribute("aria-invalid", bad ? "true" : "false");
        if (bad) ok = false;
      });
      if (!ok) {
        status.hidden = false;
        status.className = "form-status err";
        status.textContent = "Please fill in your name, company and phone number.";
        return;
      }
      if (form.website && form.website.value) return; // spam bot
      var data = new FormData(form);
      data.delete("website");
      data.append("form", form.dataset.kind);
      data.append("page", location.pathname);
      var endpoint = form.dataset.endpoint;
      if (endpoint) {
        status.hidden = false;
        status.className = "form-status";
        status.textContent = "Sending…";
        fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
          .then(function (r) {
            if (!r.ok) throw new Error();
            form.reset();
            status.textContent = "Thank you. We have your message and will reply within one working day.";
          })
          .catch(function () {
            status.className = "form-status err";
            status.textContent = "Sorry, that didn't go through. Please call +91 97896 77933 or email info@indotexnology.com.";
          });
        return;
      }
      var labels = { name: "Name", company: "Company", phone: "Phone", email: "Email", product: "Interested in",
        system: "System", urgency: "Urgency", area: "Area", message: "Message" };
      var title = { enquiry: "New enquiry", support: "Service request", careers: "Job application" }[form.dataset.kind] || "Enquiry";
      var lines = [title + " from indotexnology.com"];
      data.forEach(function (v, k) { if (labels[k] && String(v).trim()) lines.push(labels[k] + ": " + v); });
      window.open("https://wa.me/" + form.dataset.wa + "?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
      status.hidden = false;
      status.className = "form-status";
      status.textContent = "WhatsApp has opened with your details. Press send there to reach us. You can also email info@indotexnology.com.";
    });
  });
})();

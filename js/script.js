const toggleBtn = document.getElementById("theme-toggle");
const TRANSITION_DURATION = 600;

const THEMES = {
  light: {
    particleFrom: "#4facfe",
    particleTo: "#00f2fe"
  },
  dark: {
    particleFrom: "#a18cd1",
    particleTo: "#fbc2eb"
  }
};

particlesJS("particles-js", {
  particles: {
    number: { value: 80 },
    color: { value: "#ffffff" },
    line_linked: { enable: true, color: "#ffffff" },
    shape: { type: "circle" },
    opacity: { value: 0.6 },
    size: { value: 3 },
    move: { enable: true, speed: 3 }
  }
});

function easeInOut(t) {
  return t < 0.5
    ? 2 * t * t
    : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function hexToRgb(hex) {
  hex = hex.replace("#", "");
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16)
  };
}

function interpolateColor(start, end, factor) {
  return {
    r: Math.round(start.r + (end.r - start.r) * factor),
    g: Math.round(start.g + (end.g - start.g) * factor),
    b: Math.round(start.b + (end.b - start.b) * factor)
  };
}

function rgbToString({ r, g, b }) {
  return `rgb(${r},${g},${b})`;
}

function animateParticleColors(fromColor, toColor) {
  const pJS = window.pJSDom[0].pJS;
  const start = performance.now();

  const startColor = hexToRgb(fromColor);
  const endColor = hexToRgb(toColor);

  function animate(time) {
    let progress = Math.min((time - start) / TRANSITION_DURATION, 1);
    progress = easeInOut(progress);

    const current = interpolateColor(startColor, endColor, progress);
    const colorStr = rgbToString(current);

    pJS.particles.color.value = colorStr;
    pJS.particles.line_linked.color = colorStr;

    pJS.particles.array.forEach(p => {
      p.color.value = colorStr;
      p.color.rgb = current;
    });

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}

function updateThemeIcon(theme) {
  toggleBtn.textContent = theme === "dark" ? "☀️" : "🌙";
}

function applyTheme(theme, save = true) {
  const { particleFrom, particleTo } = THEMES[theme];

  document.body.classList.add("transitioning");
  animateParticleColors(particleFrom, particleTo);

  requestAnimationFrame(() => {
    document.body.classList.toggle("dark", theme === "dark");
    updateThemeIcon(theme);
  });

  setTimeout(() => {
    document.body.classList.remove("transitioning");
  }, TRANSITION_DURATION);

  if (save) localStorage.setItem("theme", theme);
}

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function initTheme() {
  const saved = localStorage.getItem("theme");
  applyTheme(saved || getSystemTheme(), false);
}

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
  if (!localStorage.getItem("theme")) {
    applyTheme(e.matches ? "dark" : "light", false);
  }
});

toggleBtn.addEventListener("click", () => {
  const isDark = document.body.classList.contains("dark");
  applyTheme(isDark ? "light" : "dark");
});

initTheme();

// Highlight active page
const links = document.querySelectorAll(".nav-link");
const currentPage = window.location.pathname.split("/").pop();

links.forEach(link => {
  if (link.getAttribute("href") === currentPage) {
    link.classList.add("active");
  }
});

// Typing animation

const typingEl = document.getElementById("typing");

if (typingEl) {
  const words = ["Software Developer", "Engineer", "AI Enthusiast"];
  let i = 0, j = 0, current = "", isDeleting = false;

  function type() {
    const word = words[i];

    if (isDeleting) {
      current = word.substring(0, j--);
    } else {
      current = word.substring(0, j++);
    }

    typingEl.textContent = current;

    if (!isDeleting && j === word.length + 1) {
      isDeleting = true;
      setTimeout(type, 1000);
      return;
    }

    if (isDeleting && j === 0) {
      isDeleting = false;
      i = (i + 1) % words.length;
    }

    setTimeout(type, isDeleting ? 50 : 100);
  }

  type();
}

// Expandable cards

document.querySelectorAll(".expandable").forEach(card => {
  card.addEventListener("click", () => {
    card.classList.toggle("active");
  });
});

// Contact form handler
const form = document.getElementById("contact-form");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      message: document.getElementById("message").value
    };

    try {
      const res = await fetch("http://localhost:3000/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        alert("Message sent!");
        form.reset();
      } else {
        alert("Failed to send message.");
      }
    } catch (err) {
      alert("Server error.");
    }
  });
}
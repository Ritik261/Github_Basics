document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const categoryInput = document.getElementById("category");
  const descriptionInput = document.getElementById("description");
  const ticketsSection = document.getElementById("tickets-section");
  const ticketsContainer = document.getElementById("tickets-container");

  // Load tickets from localStorage
  let tickets = JSON.parse(localStorage.getItem("tickets")) || [];

  // Function to save tickets to localStorage
  const saveTickets = () => {
    localStorage.setItem("tickets", JSON.stringify(tickets));
  };

  // Function to render all tickets
  const renderTickets = () => {
    if (tickets.length === 0) {
      ticketsSection.style.display = "none";
      return;
    }

    ticketsSection.style.display = "block";
    ticketsContainer.innerHTML = "";

    tickets.forEach((ticket, index) => {
      const ticketCard = document.createElement("div");
      ticketCard.className = `ticket-item ${ticket.status === "resolved" ? "resolved" : ""}`;
      
      ticketCard.innerHTML = `
        <div class="ticket-header">
          <span class="ticket-id">#TKT-${1000 + index}</span>
          <span class="ticket-status-badge ${ticket.status}">${ticket.status.toUpperCase()}</span>
        </div>
        <div class="ticket-meta">
          <strong>From:</strong> ${escapeHTML(ticket.name)} (${escapeHTML(ticket.email)}) | 
          <strong>Category:</strong> ${escapeHTML(ticket.category)}
        </div>
        <p class="ticket-desc">${escapeHTML(ticket.description)}</p>
        <div class="ticket-actions">
          ${ticket.status === "open" ? `<button class="btn-resolve" data-index="${index}">Mark Resolved</button>` : ""}
          <button class="btn-delete" data-index="${index}">Delete</button>
        </div>
      `;
      ticketsContainer.appendChild(ticketCard);
    });

    // Add event listeners to actions
    document.querySelectorAll(".btn-resolve").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = e.target.getAttribute("data-index");
        tickets[idx].status = "resolved";
        saveTickets();
        renderTickets();
        showToast("Ticket marked as resolved!");
      });
    });

    document.querySelectorAll(".btn-delete").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = e.target.getAttribute("data-index");
        tickets.splice(idx, 1);
        saveTickets();
        renderTickets();
        showToast("Ticket deleted successfully.", "warning");
      });
    });
  };

  // Helper to escape HTML tags to prevent XSS
  const escapeHTML = (str) => {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  };

  // Toast Notification System
  const showToast = (message, type = "success") => {
    // Remove existing toast if any
    const existingToast = document.querySelector(".toast-notification");
    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.className = `toast-notification ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger transition
    setTimeout(() => {
      toast.classList.add("show");
    }, 10);

    // Auto-remove toast
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  // Form submission handler
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const category = categoryInput.value;
    const description = descriptionInput.value.trim();

    // Simple validation
    if (!name || !email || !description) {
      showToast("Please fill in all fields.", "error");
      return;
    }

    // Email regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    // Add new ticket
    const newTicket = {
      name,
      email,
      category,
      description,
      status: "open",
      timestamp: new Date().toISOString()
    };

    tickets.push(newTicket);
    saveTickets();
    renderTickets();

    // Reset Form
    form.reset();
    showToast("Ticket submitted successfully!");
  });

  // Initial render
  renderTickets();
});

const customerForm = document.getElementById("customerManagementForm");
const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const birthDateInput = document.getElementById("birthDate");

const saveCustomerBtn = document.getElementById("saveCustomerBtn");
const updateCustomerBtn = document.getElementById("updateCustomerBtn");
const deleteCustomerBtn = document.getElementById("deleteCustomerBtn");
const clearCustomerBtn = document.getElementById("clearCustomerBtn");
const customerFormMessage = document.getElementById("customerFormMessage");

let selectedCustomerId = null;

function showFormMessage(message, isError = false) {
  customerFormMessage.textContent = message;
  customerFormMessage.style.color = isError ? "red" : "green";
}

function clearCustomerForm() {
  customerForm.reset();
  selectedCustomerId = null;
  saveCustomerBtn.disabled = false;
  updateCustomerBtn.disabled = true;
  deleteCustomerBtn.disabled = true;
  showFormMessage("");

  document.querySelectorAll(".customer-card").forEach(card => {
    card.classList.remove("customer-selected");
  });
}

function fillCustomerForm(person) {
  firstNameInput.value = person.first_name || "";
  lastNameInput.value = person.last_name || "";
  emailInput.value = person.email || "";
  phoneInput.value = person.phone || "";
  birthDateInput.value = person.birth_date ? person.birth_date.slice(0, 10) : "";

  selectedCustomerId = person.id;

  saveCustomerBtn.disabled = true;
  updateCustomerBtn.disabled = false;
  deleteCustomerBtn.disabled = false;

  showFormMessage(`Selected customer ID ${person.id}`);
}

async function loadCustomers() {
  const container = document.getElementById("customer-list");

  try {
    const res = await fetch("/api/persons");

    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await res.json();

    container.innerHTML = "";

    if (data.length === 0) {
      container.innerHTML = "<p>No customers found.</p>";
      return;
    }

    data.forEach(person => {
      const div = document.createElement("div");
      div.className = "customer-card";

      div.innerHTML = `
        <strong>${person.first_name} ${person.last_name}</strong><br>
        Email: ${person.email}<br>
        Phone: ${person.phone || "-"}
      `;

      div.addEventListener("click", () => {
        document.querySelectorAll(".customer-card").forEach(card => {
          card.classList.remove("customer-selected");
        });

        div.classList.add("customer-selected");
        fillCustomerForm(person);
      });

      container.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = "<p style='color:red;'>Error loading data</p>";
  }
}

customerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newCustomer = {
    first_name: firstNameInput.value.trim(),
    last_name: lastNameInput.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim(),
    birth_date: birthDateInput.value
  };

  try {
    const res = await fetch("/api/persons", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newCustomer)
    });

    if (!res.ok) {
      throw new Error("Failed to add customer");
    }

    clearCustomerForm();
    showFormMessage("Customer added successfully");
    await loadCustomers();
  } catch (err) {
    console.error(err);
    showFormMessage("Error adding customer", true);
  }
});

updateCustomerBtn.addEventListener("click", async () => {
  if (!selectedCustomerId) return;

  const updatedCustomer = {
    first_name: firstNameInput.value.trim(),
    last_name: lastNameInput.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim(),
    birth_date: birthDateInput.value
  };

  try {
    const res = await fetch(`/api/persons/${selectedCustomerId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedCustomer)
    });

    if (!res.ok) {
      throw new Error("Failed to update customer");
    }

    clearCustomerForm();
    showFormMessage("Customer updated successfully");
    await loadCustomers();
  } catch (err) {
    console.error(err);
    showFormMessage("Error updating customer", true);
  }
});

deleteCustomerBtn.addEventListener("click", async () => {
  if (!selectedCustomerId) return;

  try {
    const res = await fetch(`/api/persons/${selectedCustomerId}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      throw new Error("Failed to delete customer");
    }

    clearCustomerForm();
    showFormMessage("Customer deleted successfully");
    await loadCustomers();
  } catch (err) {
    console.error(err);
    showFormMessage("Error deleting customer", true);
  }
});

clearCustomerBtn.addEventListener("click", () => {
  clearCustomerForm();
});

updateCustomerBtn.disabled = true;
deleteCustomerBtn.disabled = true;

loadCustomers();
// =========================================================================
// 1. GLOBAL VARIABLES & INITIALIZATION
// =========================================================================

// Fetching DOM elements by their IDs
const title = document.getElementById("title");
const price = document.getElementById("price");
const taxes = document.getElementById("taxes");
const ads = document.getElementById("ads");
const discount = document.getElementById("discount");
const total = document.getElementById("total");
const count = document.getElementById("count");
const category = document.getElementById("category");
const submit = document.getElementById("submit");
const search = document.getElementById("search");
const searchTitle = document.getElementById("searchTitle");
const searchCategory = document.getElementById("searchCategory");
const thbody = document.getElementById("thbody");
const deleteAllBox = document.getElementById("deleteAllBox");

// State Management variables
let mood = "create"; // App mode: 'create' or 'update'
let tmpIndex; // Temporary variable to store the index of the product being updated

// Products Array: Load from LocalStorage if available, otherwise start fresh
let datePro = localStorage.product ? JSON.parse(localStorage.product) : [];

// =========================================================================
// 2. HELPER FUNCTIONS
// =========================================================================

/*
  -Calculates the total cost of the product dynamically
  -Formula: (Price + Taxes + Ads) - Discount
*/
function getTotal() {
  if (price.value != "") {
    // Convert string values to numbers and calculate total
    let result = +price.value + +taxes.value + +ads.value - +discount.value;
    total.innerHTML = `Total: ${result}`;

    // UI Feedback: Change background to green on success
    total.classList.remove("bg-danger");
    total.classList.add("bg-success");
  } else {
    // Reset to default if price input is empty
    total.innerHTML = "Total: 0";
    total.classList.remove("bg-success");
    total.classList.add("bg-danger");
  }
}

// Bind input events to calculate the total instantly while typing
[price, taxes, ads, discount].forEach((input) => {
  input.addEventListener("keyup", getTotal);
});

/*
  -Resets and clears all form input fields
*/
function clearData() {
  title.value = "";
  price.value = "";
  taxes.value = "";
  ads.value = "";
  discount.value = "";
  total.innerHTML = "Total: 0";
  total.classList.remove("bg-success");
  total.classList.add("bg-danger");
  count.value = "";
  category.value = "";
}

// =========================================================================
// 3. CORE CRUD OPERATIONS
// =========================================================================

/*
  -[CREATE & UPDATE] Handles saving a new product or updating an existing one
*/
submit.onclick = function () {
  // Basic Form Validation: Check if required fields are filled
  if (title.value != "" && price.value != "" && category.value != "") {
    // Build the new product object
    let newPro = {
      title: title.value.toLowerCase(),
      price: price.value,
      taxes: taxes.value || 0,
      ads: ads.value || 0,
      discount: discount.value || 0,
      total: total.innerHTML.split(": ")[1],
      category: category.value.toLowerCase(),
    };

    // Check whether creating new items or updating an old one
    if (mood === "create") {
      // Bulk insert feature based on the Count value
      let productCount = +count.value > 0 ? +count.value : 1;
      for (let i = 0; i < productCount; i++) {
        dataPro.push(newPro);
      }
    } else {
      // Update mode: Replace the old product item
      dataPro[tmpIndex] = newPro;
      mood = "create";
      submit.innerHTML = "Create Product";
      submit.classList.remove("btn-warning");
      submit.classList.add("btn-primary");
      count.style.display = "block"; // Re-show the count input field
    }

    // Save the updated array into LocalStorage
    localStorage.setItem("product", JSON.stringify(dataPro));

    clearData(); // Reset the form
    showData(); // Refresh the data table
  } else {
    alert("Please fill in Title, Price, and Category!");
  }
};

/*
  -[READ] Renders products data into the HTML table and manages the "Delete All" button
*/
function showData() {
  let table = "";

  // Construct the table rows dynamically
  for (let i = 0; i < dataPro.length; i++) {
    table += `
        <tr>
            <td>${i + 1}</td>
            <td>${dataPro[i].title}</td>
            <td>${dataPro[i].price}</td>
            <td>${dataPro[i].taxes}</td>
            <td>${dataPro[i].ads}</td>
            <td>${dataPro[i].discount}</td>
            <td>${dataPro[i].total}</td>
            <td>${dataPro[i].category}</td>
            <td><button onclick="updateData(${i})" class="btn btn-sm btn-warning fw-bold">Update</button></td>
            <td><button onclick="deleteData(${i})" class="btn btn-sm btn-danger fw-bold">Delete</button></td>
        </tr>
        `;
  }

  tbody.innerHTML = table;

  // Toggle the "Delete All" button wrapper based on data availability
  if (dataPro.length > 0) {
    deleteAllBox.innerHTML = `
            <button onclick="deleteAll()" class="btn btn-danger w-100 fw-bold py-2">
                Delete All (${dataPro.length})
            </button>
        `;
  } else {
    deleteAllBox.innerHTML = "";
  }
}

// Invoke the function on page load to restore saved data
showData();

/*
  -[DELETE] Removes a single product by its index
*/
function deleteData(i) {
  if (confirm("Are you sure you want to delete this product?")) {
    dataPro.splice(i, 1);
    localStorage.product = JSON.stringify(dataPro);
    showData();
  }
}

/*
  -[DELETE ALL] Wipes out the entire dataset from both array and LocalStorage
*/
function deleteAll() {
  if (confirm("🚨 Warning! Are you sure you want to delete ALL products?")) {
    localStorage.clear();
    dataPro = [];
    showData();
  }
}

/*
  -[UPDATE STATE] Loads selected product details back into the form fields for editing
*/
function updateData(i) {
  // Populate form fields with existing data
  title.value = dataPro[i].title;
  price.value = dataPro[i].price;
  taxes.value = dataPro[i].taxes;
  ads.value = dataPro[i].ads;
  discount.value = dataPro[i].discount;
  category.value = dataPro[i].category;

  getTotal(); // Re-calculate the total for the selected product

  count.style.display = "none"; // Hide count input field during updates
  submit.innerHTML = "Update Product";
  submit.classList.remove("btn-primary");
  submit.classList.add("btn-warning");

  // Switch state to update mode and cache the target index
  mood = "update";
  tmpIndex = i;

  // Smooth scroll back to top so the user notices the loaded data
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// =========================================================================
// 4. SEARCH & FILTER LOGIC
// =========================================================================

let searchMood = "title"; // Default search criterion

/*
  -Sets the active search filter (by Title or Category) and adjusts the UI placeholder
*/
function getSearchMood(id) {
  if (id === "searchTitle") {
    searchMood = "title";
  } else {
    searchMood = "category";
  }
  search.placeholder =
    "Search By " + searchMood.charAt(0).toUpperCase() + searchMood.slice(1);
  search.focus();
  search.value = "";
  showData(); // Reset the data table view when changing search mode
}

// Bind search action buttons to the configuration function
searchTitle.onclick = function () {
  getSearchMood(this.id);
};
searchCategory.onclick = function () {
  getSearchMood(this.id);
};

/*
  -Handles real-time text matching and updates the table on-the-fly
*/
search.onkeyup = function () {
  let value = this.value.toLowerCase();
  let table = "";

  for (let i = 0; i < dataPro.length; i++) {
    let isMatch = false;

    // Evaluate conditions based on current search filter criteria
    if (searchMood === "title") {
      isMatch = dataPro[i].title.includes(value);
    } else {
      isMatch = dataPro[i].category.includes(value);
    }

    // Concat only matched rows into the new table view
    if (isMatch) {
      table += `
            <tr>
                <td>${i + 1}</td>
                <td>${dataPro[i].title}</td>
                <td>${dataPro[i].price}</td>
                <td>${dataPro[i].taxes}</td>
                <td>${dataPro[i].ads}</td>
                <td>${dataPro[i].discount}</td>
                <td>${dataPro[i].total}</td>
                <td>${dataPro[i].category}</td>
                <td><button onclick="updateData(${i})" class="btn btn-sm btn-warning fw-bold">Update</button></td>
                <td><button onclick="deleteData(${i})" class="btn btn-sm btn-danger fw-bold">Delete</button></td>
            </tr>
            `;
    }
  }
  tbody.innerHTML = table;
};

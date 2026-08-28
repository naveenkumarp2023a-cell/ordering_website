// script2.js — Food Order Confirmation Logic

function placeOrder() {

  // --- Step 1: Get the values from the form fields ---
  var customerName    = document.getElementById("customerName").value.trim();
  var deliveryAddress = document.getElementById("deliveryAddress").value.trim();

  // For radio buttons we loop through all options to find which one is selected
  var paymentRadios   = document.getElementsByName("payment");
  var selectedPayment = "";   // will store the chosen payment method

  for (var i = 0; i < paymentRadios.length; i++) {
    if (paymentRadios[i].checked) {
      selectedPayment = paymentRadios[i].value;
      break;   // stop as soon as we find the selected one
    }
  }

  // --- Step 2: Get references to the message elements ---
  var errorMessage   = document.getElementById("errorMessage");
  var successMessage = document.getElementById("successMessage");

  // Hide both messages before checking (in case they were shown before)
  errorMessage.style.display   = "none";
  successMessage.style.display = "none";
  errorMessage.textContent     = "";
  successMessage.textContent   = "";

  // --- Step 3: Validate each field ---

  // Check if the customer name is empty
  if (customerName === "") {
    errorMessage.textContent   = "Please enter your name.";
    errorMessage.style.display = "block";
    return;   // stop here — do not proceed further
  }

  // Check if the delivery address is empty
  if (deliveryAddress === "") {
    errorMessage.textContent   = "Please enter your delivery address.";
    errorMessage.style.display = "block";
    return;   // stop here
  }

  // Check if a payment method has been selected
  if (selectedPayment === "") {
    errorMessage.textContent   = "Please select a payment method.";
    errorMessage.style.display = "block";
    return;   // stop here
  }

  // --- Step 4: All fields are filled — show success message ---
  successMessage.textContent   = "Order Placed Successfully! Thank you, "
                                  + customerName
                                  + ". Your order will be delivered to the provided address. Payment via "
                                  + selectedPayment
                                  + ".";
  successMessage.style.display = "block";
}

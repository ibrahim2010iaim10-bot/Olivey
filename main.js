// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDUtNjcANL8FMjy1EBSsUV0UI9HjC3El_s",
  authDomain: "olive-oil-store-a1f4e.firebaseapp.com",
  projectId: "olive-oil-store-a1f4e",
  storageBucket: "olive-oil-store-a1f4e.firebasestorage.app",
  messagingSenderId: "86985218712",
  appId: "1:86985218712:web:e04766588d814c1aa24eed",
  measurementId: "G-13XTDD8J8J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
console.log("Firebase connected!");

// Load Products
async function loadProducts(){
  const productsDiv = document.getElementById("products");
  if(!productsDiv) return;

  const products = [
    {name:"Extra Virgin Olive Oil 1L", price:250, img:"oil1.jpg"},
    {name:"Premium Olive Oil 500ml", price:150, img:"oil2.jpg"}
  ];

  products.forEach(p=>{
    const div=document.createElement("div");
    div.className="product";
    div.innerHTML=`
      <img src="${p.img}" class="product-img">
      <h3>${p.name}</h3>
      <p>${p.price} EGP</p>
      <button onclick='addToCart("${p.name}",${p.price})'>Add to cart</button>`;
    productsDiv.appendChild(div);
  });
}

// Add to cart
window.addToCart = function(name, price){
  let cart = JSON.parse(localStorage.getItem("cart")||"[]");
  cart.push({name,price});
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Added to cart!");
}

// Load cart
function loadCart(){
  const cartDiv=document.getElementById("cart");
  if(!cartDiv) return;

  let cart = JSON.parse(localStorage.getItem("cart")||"[]");
  cartDiv.innerHTML = cart.map(c=>`<p>${c.name} - ${c.price} EGP</p>`).join("");
}

// Checkout with customer details
const form = document.getElementById('orderForm');
if(form){
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;

    await addDoc(collection(db, "orders"), {
      name,
      phone,
      address,
      items: JSON.parse(localStorage.getItem("cart")||"[]"),
      createdAt: new Date().toISOString()
    });

    alert("Order submitted!");
    localStorage.removeItem("cart");
    document.getElementById('cart').innerHTML = "";
    form.reset();
  });
}

// Load Orders in Admin - organized view
async function loadOrders(){
  const ordersDiv = document.getElementById("orders");
  if(!ordersDiv) return;

  const snap = await getDocs(collection(db,"orders"));
  const ordersArray = [];
  snap.forEach(doc => ordersArray.push(doc.data()));

  // Sort orders by date (newest first)
  ordersArray.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Display each order
  ordersArray.forEach(data => {
    let orderHTML = `<div class='order'>
      <h3>Customer: ${data.name}</h3>
      <p>Phone: ${data.phone}</p>
      <p>Address: ${data.address}</p>
      <p>Ordered at: ${new Date(data.createdAt).toLocaleString()}</p>
      <h4>Items:</h4>
      <ul>`;
    data.items.forEach(item => {
      orderHTML += `<li>${item.name} - ${item.price} EGP</li>`;
    });
    orderHTML += `</ul></div>`;
    ordersDiv.innerHTML += orderHTML;
  });
}

// Run functions
loadProducts();
loadCart();
loadOrders();

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDUtNjcANL8FMjy1EBSsUV0UI9HjC3El_s",
  authDomain: "olive-oil-store-a1f4e.firebaseapp.com",
  projectId: "olive-oil-store-a1f4e",
  storageBucket: "olive-oil-store-a1f4e.firebasestorage.app",
  messagingSenderId: "86985218712",
  appId: "1:86985218712:web:141fefe56a49fea4a24eed",
  measurementId: "G-RLFXZRMS29"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth();

// Products
const products = [
  {name:"Extra Virgin Olive Oil 1L", price:250, img:"oil1.jpg"},
  {name:"Premium Olive Oil 500ml", price:150, img:"oil2.jpg"}
];

// Load Products
function loadProducts(){
  const productsDiv = document.getElementById("products");
  if(!productsDiv) return;
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

// Checkout - add order to Firestore
const form = document.getElementById('orderForm');
if(form){
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    let cart = JSON.parse(localStorage.getItem("cart")||"[]");

    await addDoc(collection(db, "orders"), {
      name,
      phone,
      address,
      items: cart,
      createdAt: new Date().toISOString()
    });

    alert("Order submitted!");
    localStorage.removeItem("cart");
    document.getElementById('cart').innerHTML = "";
    form.reset();
  });
}

// Admin Login
const loginForm = document.getElementById("loginForm");
if(loginForm){
  loginForm.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const email = document.getElementById("adminEmail").value;
    const password = document.getElementById("adminPassword").value;

    try{
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "admin.html";
    }catch(err){
      document.getElementById("error").textContent = err.message;
    }
  });
}

// Load Orders in Admin
async function loadOrders(){
  const ordersDiv = document.getElementById("orders");
  if(!ordersDiv) return;

  const snap = await getDocs(collection(db,"orders"));
  const ordersArray = [];
  snap.forEach(doc => ordersArray.push(doc.data()));

  ordersArray.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

  ordersDiv.innerHTML = "";
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

// Initialize
loadProducts();
loadCart();
loadOrders();

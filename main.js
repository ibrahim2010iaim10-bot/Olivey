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

// Checkout
async function checkout(){
  let cart = JSON.parse(localStorage.getItem("cart")||"[]");
  if(cart.length===0) return alert("Cart empty");

  await addDoc(collection(db,"orders"),{
    items: cart,
    date: new Date().toISOString()
  });

  localStorage.removeItem("cart");
  alert("Order placed!");
}

// Load Orders in Admin
async function loadOrders(){
  const ordersDiv=document.getElementById("orders");
  if(!ordersDiv) return;

  const snap = await getDocs(collection(db,"orders"));
  snap.forEach(doc=>{
    const data=doc.data();
    ordersDiv.innerHTML += `<div class='order'><h3>Order</h3><pre>${JSON.stringify(data,null,2)}</pre></div>`;
  });
}

// Run functions
loadProducts();
loadCart();
const checkoutBtn = document.getElementById("checkout");
if(checkoutBtn) checkoutBtn.onclick = checkout;
loadOrders();

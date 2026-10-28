
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FoodCard from "../components/FoodCard";
import RestaurantCard from "../components/RestaurantCard";
import "../styles/Home.css";
export default function Home() {
  return (
    <>
      <Navbar />

      <main className="home-page">
        <section className="home-hero">
          <div className="home-container">
            <p className="home-eyebrow">
              GOOD FOOD, GREAT MOOD
            </p>

            <h1>
              Cravings called.
              <br />
              <span>We deliver.</span>
            </h1>

            <p className="home-description">
              Discover your favourite meals, explore restaurants
              and get delicious food delivered to your doorstep.
            </p>

            <a className="home-cta" href="/restaurants">
              Explore restaurants →
            </a>
          </div>
        </section>

        <section className="home-container home-section">
          <p className="home-eyebrow">EXPLORE QUICKBITE</p>
          <h2>Your next favourite meal awaits.</h2>
          <p>
            We'll bring your food categories, restaurant listings
            and popular dishes here.
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}

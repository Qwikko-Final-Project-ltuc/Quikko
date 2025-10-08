import { ShoppingBag, CreditCard, Search, Heart } from "lucide-react";
import TeamCollaboration from "../../assets/team_collaboration.jpg";

export default function AboutPage() {
  return (
    <main className="font-sans text-gray-800">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-200 to-gray-300 text-gray-900 py-16 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Empowering Local Businesses, <br /> Connecting Communities
          </h1>
          <p className="text-base text-gray-700 max-w-2xl mx-auto">
            We’re on a mission to make local shopping simpler, faster, and more
            rewarding — for customers and merchants alike.
          </p>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center px-6">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Who We Are</h2>
            <p className="text-gray-600 leading-relaxed">
              We are a platform built to connect local customers with passionate
              merchants, all in one place. Our mission is to make shopping
              easier, faster, and more accessible for everyone.
            </p>
          </div>
          <img
            src={TeamCollaboration}
            alt="Team collaboration"
            className="w-full rounded-3xl shadow-2xl object-cover"
          />
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center px-6">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80"
            alt="Mission teamwork"
            className="rounded-3xl shadow-2xl w-full object-cover order-1 md:order-none"
          />
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              To simplify how people discover and shop from nearby stores, while
              giving merchants digital tools to grow, compete, and connect with
              their customers effectively.
            </p>
          </div>
        </div>
      </section>

      {/* Our Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center px-6">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              To become the leading hub where local shopping meets global
              convenience — empowering communities, sustaining small businesses,
              and inspiring smarter choices.
            </p>
          </div>
          <img
            src="https://images.unsplash.com/photo-1532619187608-e5375cab36aa?auto=format&fit=crop&w=800&q=80"
            alt="Vision and growth"
            className="rounded-3xl shadow-2xl w-full object-cover"
          />
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose Us</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We bring together everything you need to make local shopping
              effortless and rewarding.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow duration-300 text-center">
              <div className="flex justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Unified Experience
              </h3>
              <p className="text-gray-600">
                All your favorite local stores — one seamless platform.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow duration-300 text-center">
              <div className="flex justify-center mb-4">
                <CreditCard className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Seamless Checkout
              </h3>
              <p className="text-gray-600">
                Shop across multiple merchants with a single click.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow duration-300 text-center">
              <div className="flex justify-center mb-4">
                <Search className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Smart Discovery
              </h3>
              <p className="text-gray-600">
                Find unique products tailored to your interests.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow duration-300 text-center">
              <div className="flex justify-center mb-4">
                <Heart className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Community Impact
              </h3>
              <p className="text-gray-600">
                Every purchase supports real local businesses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="py-16 bg-gray-100 text-center text-gray-800">
        <div className="max-w-3xl mx-auto space-y-4 px-6">
          <p className="text-lg font-medium">
            Whether you’re a shopper looking for convenience or a merchant
            seeking growth —
          </p>
          <h3 className="text-2xl font-bold text-indigo-600">
            We’re here to make it happen.
          </h3>
        </div>
      </section>
    </main>
  );
}

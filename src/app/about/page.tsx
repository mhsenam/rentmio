import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MapPin,
  Shield,
  Clock,
  Star,
  Heart,
  Users,
  MessageSquare,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      {/* Hero Section */}
      <section className="py-8 md:py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            About RentMe
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            We&apos;re on a mission to make finding and booking your perfect
            accommodation easier than ever.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Story</h2>
            <p className="text-gray-600 mb-4">
              RentMe was founded in 2023 with a simple vision: to create a
              seamless platform that connects travelers with unique
              accommodations around the world. We believe that where you stay is
              more than just a place to sleep—it&apos;s an integral part of your
              travel experience.
            </p>
            <p className="text-gray-600 mb-6">
              What started as a small idea has grown into a comprehensive
              platform featuring thousands of properties across the globe, from
              cozy apartments in bustling city centers to serene cabins tucked
              away in nature.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild>
                <Link href="/search">Browse Properties</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-[300px] md:h-[400px] w-full rounded-lg overflow-hidden">
            <Image
              src="/images/about-hero.jpg"
              alt="About RentMe"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gray-50 my-10 rounded-lg">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Why Choose RentMe?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We&apos;ve designed our platform with both guests and hosts in mind,
            offering features that make property booking and management simple
            and enjoyable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <MapPin className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Diverse Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Discover properties in thousands of destinations worldwide, from
                popular tourist spots to hidden gems.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Secure Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Our secure payment system and verification process ensure safe
                and trustworthy transactions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Star className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Verified Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Real reviews from real guests help you make informed decisions
                about your stay.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <MessageSquare className="h-8 w-8 text-primary mb-2" />
              <CardTitle>24/7 Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Our customer support team is available around the clock to
                assist with any questions or issues.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="bg-primary/5 p-6 rounded-lg">
            <p className="text-3xl md:text-4xl font-bold text-primary mb-2">
              10K+
            </p>
            <p className="text-sm font-medium">Properties Listed</p>
          </div>
          <div className="bg-primary/5 p-6 rounded-lg">
            <p className="text-3xl md:text-4xl font-bold text-primary mb-2">
              50+
            </p>
            <p className="text-sm font-medium">Countries</p>
          </div>
          <div className="bg-primary/5 p-6 rounded-lg">
            <p className="text-3xl md:text-4xl font-bold text-primary mb-2">
              100K+
            </p>
            <p className="text-sm font-medium">Happy Guests</p>
          </div>
          <div className="bg-primary/5 p-6 rounded-lg">
            <p className="text-3xl md:text-4xl font-bold text-primary mb-2">
              4.8
            </p>
            <p className="text-sm font-medium">Average Rating</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-8 md:py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Meet Our Team</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            The passionate individuals behind RentMe who work tirelessly to
            create the best experience for our users.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <div className="relative h-60 w-full overflow-hidden rounded-t-lg">
              <Image
                src="/images/team-1.jpg"
                alt="Sarah Johnson"
                fill
                className="object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>Sarah Johnson</CardTitle>
              <CardDescription>Co-Founder & CEO</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                With a background in hospitality and tech, Sarah leads our
                vision and strategy with passion and innovation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <div className="relative h-60 w-full overflow-hidden rounded-t-lg">
              <Image
                src="/images/team-2.jpg"
                alt="Michael Chen"
                fill
                className="object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>Michael Chen</CardTitle>
              <CardDescription>Co-Founder & CTO</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Michael brings extensive experience in software development and
                ensures our platform runs seamlessly.
              </p>
            </CardContent>
          </Card>

          <Card>
            <div className="relative h-60 w-full overflow-hidden rounded-t-lg">
              <Image
                src="/images/team-3.jpg"
                alt="Jessica Williams"
                fill
                className="object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>Jessica Williams</CardTitle>
              <CardDescription>Head of Customer Experience</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Jessica is dedicated to ensuring that every guest and host has
                an exceptional experience on our platform.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-8 md:py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Our Values</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            These core principles guide everything we do at RentMe.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-start gap-6 p-6 bg-gray-50 rounded-lg">
            <div className="md:w-12 flex-shrink-0">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Community</h3>
              <p className="text-gray-600">
                We believe in fostering connections between travelers and hosts,
                creating a global community bound by shared experiences and
                mutual respect.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-6 p-6 bg-gray-50 rounded-lg">
            <div className="md:w-12 flex-shrink-0">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Passion</h3>
              <p className="text-gray-600">
                We&apos;re passionate about travel and committed to making every
                journey memorable by connecting guests with the perfect place to
                stay.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-6 p-6 bg-gray-50 rounded-lg">
            <div className="md:w-12 flex-shrink-0">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Innovation</h3>
              <p className="text-gray-600">
                We continuously strive to improve our platform, using
                cutting-edge technology to simplify property booking and
                management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 md:py-16 my-8 bg-primary text-white rounded-lg">
        <div className="text-center max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to find your perfect stay?
          </h2>
          <p className="mb-6 text-white/90">
            Join thousands of satisfied travelers who have discovered their
            ideal accommodations through RentMe.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-white text-primary hover:bg-white/90">
              <Link href="/search">Search Properties</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  return (
    <div className="container py-16 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
          Contact Us
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          Have questions or want to learn more? Get in touch with our team.
        </p>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Send a Message</CardTitle>
              <CardDescription>
                Fill out the form below and we&apos;ll get back to you as soon as
                possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Your email address"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="How can we help you?"
                    className="min-h-[120px]"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-2">Office Location</h3>
              <address className="not-italic text-muted-foreground">
                123 Modern Street
                <br />
                Suite 456
                <br />
                San Francisco, CA 94103
                <br />
                United States
              </address>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">Contact Information</h3>
              <p className="text-muted-foreground">
                Email: hello@modernsite.com
              </p>
              <p className="text-muted-foreground">Phone: +1 (555) 123-4567</p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">Business Hours</h3>
              <p className="text-muted-foreground">
                Monday - Friday: 9am - 5pm PST
              </p>
              <p className="text-muted-foreground">Saturday - Sunday: Closed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

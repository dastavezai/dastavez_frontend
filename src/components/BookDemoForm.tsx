import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";
import { contactAPI } from "@/lib/api";

// Form validation schema
const demoFormSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  firmName: z.string().min(2, "Company name is required"),
  jobTitle: z.string().min(2, "Job title is required"),
  country: z.string().min(1, "Please select a country"),
  organizationType: z.string().min(1, "Please select an organization type"),
  teamSize: z.string().min(1, "Please select team size"),
  phone: z.string().optional(),
  hearAbout: z.string().min(1, "This field is required"),
  newsletter: z.boolean().default(false),
});

type DemoFormValues = z.infer<typeof demoFormSchema>;

interface BookDemoFormProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function BookDemoForm({
  trigger,
  onSuccess,
}: BookDemoFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DemoFormValues>({
    resolver: zodResolver(demoFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      firmName: "",
      jobTitle: "",
      country: "",
      organizationType: "",
      teamSize: "",
      hearAbout: "",
      newsletter: false,
    },
  });

  const onSubmit = async (data: DemoFormValues) => {
    setIsSubmitting(true);
    try {
      // Format the message with all demo details
      const message = `
New Demo Request Details:
-------------------------
Name: ${data.firstName} ${data.lastName}
Firm: ${data.firmName}
Job Title: ${data.jobTitle}
Country: ${data.country}
Organization Type: ${data.organizationType}
Team Size: ${data.teamSize}
Hear About: ${data.hearAbout}
Newsletter Opt-in: ${data.newsletter ? 'Yes' : 'No'}
      `.trim();

      await contactAPI.sendContact({
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        subject: `Demo Request from ${data.firmName}`,
        message: message
      });

      toast.success("Demo booked successfully! We'll contact you soon.");
      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error booking demo:", error);
      toast.error("Failed to book demo. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            size="lg"
            className="bg-gradient-to-r from-judicial-gold hover:from-judicial-gold/90 text-judicial-dark font-semibold shadow-lg shadow-judicial-gold/30 transition-all duration-300 hover:shadow-judicial-gold/50 hover:scale-105 w-full sm:w-auto dark:text-black"
          >
            <MessageSquare className="mr-2 h-5 w-5" />
            Book a Demo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[95vh] overflow-y-auto bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 p-0 shadow-2xl rounded-lg">
        <div className="p-8 md:p-10">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-10">
            Get in touch with us
          </h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* First Row - Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2 block">
                        First Name: <span className="text-orange-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="First Name"
                          className="w-full px-4 py-3 border-2 border-gray-400 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-judicial-gold dark:focus:border-judicial-gold focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-600 text-xs mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2 block">
                        Last Name: <span className="text-orange-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Last Name"
                          className="w-full px-4 py-3 border-2 border-gray-400 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-judicial-gold dark:focus:border-judicial-gold focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-600 text-xs mt-1" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Second Row - Email and Company */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2 block">
                        Email Address: <span className="text-orange-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Business Email Address"
                          className="w-full px-4 py-3 border-2 border-gray-400 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-judicial-gold dark:focus:border-judicial-gold focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-600 text-xs mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="firmName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2 block">
                        Company Name: <span className="text-orange-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Company Name"
                          className="w-full px-4 py-3 border-2 border-gray-400 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-judicial-gold dark:focus:border-judicial-gold focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-600 text-xs mt-1" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Third Row - Country and Job Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2 block">
                        Country: <span className="text-orange-600">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full px-4 py-3 border-2 border-gray-400 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:border-judicial-gold dark:focus:border-judicial-gold focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-slate-900 border-2 border-gray-400 dark:border-slate-700">
                          <SelectItem value="usa">United States</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                          <SelectItem value="india">India</SelectItem>
                          <SelectItem value="canada">Canada</SelectItem>
                          <SelectItem value="australia">Australia</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-600 text-xs mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2 block">
                        Job Title: <span className="text-orange-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Job Title"
                          className="w-full px-4 py-3 border-2 border-gray-400 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-judicial-gold dark:focus:border-judicial-gold focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-600 text-xs mt-1" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Fourth Row - Organization and Team Size */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="organizationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2 block">
                        Organization Type: <span className="text-orange-600">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full px-4 py-3 border-2 border-gray-400 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:border-judicial-gold dark:focus:border-judicial-gold focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-slate-900 border-2 border-gray-400 dark:border-slate-700">
                          <SelectItem value="law-firm">Law Firm</SelectItem>
                          <SelectItem value="corporate">Corporate</SelectItem>
                          <SelectItem value="government">Government</SelectItem>
                          <SelectItem value="non-profit">Non-Profit</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-600 text-xs mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="teamSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2 block">
                        Legal Team Size: <span className="text-orange-600">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full px-4 py-3 border-2 border-gray-400 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:border-judicial-gold dark:focus:border-judicial-gold focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-slate-900 border-2 border-gray-400 dark:border-slate-700">
                          <SelectItem value="1-5">1-5 people</SelectItem>
                          <SelectItem value="6-20">6-20 people</SelectItem>
                          <SelectItem value="21-50">21-50 people</SelectItem>
                          <SelectItem value="51-100">51-100 people</SelectItem>
                          <SelectItem value="100+">100+ people</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-600 text-xs mt-1" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Phone Number */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2 block">
                      Phone Number:
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Phone Number"
                        className="w-full px-4 py-3 border-2 border-gray-400 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-judicial-gold dark:focus:border-judicial-gold focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-600 text-xs mt-1" />
                  </FormItem>
                )}
              />

              {/* Message Field */}
              <FormField
                control={form.control}
                name="hearAbout"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2 block">
                      How did you hear about us? <span className="text-orange-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us how you found us..."
                        className="w-full px-4 py-3 border-2 border-gray-400 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-judicial-gold dark:focus:border-judicial-gold focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors resize-none min-h-[140px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-600 text-xs mt-1" />
                  </FormItem>
                )}
              />

              {/* Newsletter Checkbox */}
              <FormField
                control={form.control}
                name="newsletter"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-1 h-5 w-5 border-2 border-gray-400 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-orange-600 dark:text-judicial-gold focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </FormControl>
                    <div className="leading-relaxed">
                      <FormLabel className="text-sm text-gray-900 dark:text-gray-300 font-normal cursor-pointer">
                        Yes, I would like to receive marketing communications from Dastavez
                        regarding products, services, and events. I can unsubscribe at
                        any time
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {/* Privacy Policy Text */}
              <p className="text-xs text-gray-600 dark:text-gray-400 pt-2">
                For details about how we collect, use, and protect your information, please
                see our{" "}
                <a
                  href="/privacy"
                  className="text-orange-600 hover:underline font-semibold"
                >
                  Privacy Policy
                </a>
                .
              </p>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full px-6 py-3 bg-black dark:bg-slate-800 hover:bg-gray-900 dark:hover:bg-slate-700 text-judicial-gold font-semibold rounded transition-colors duration-200"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Form"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

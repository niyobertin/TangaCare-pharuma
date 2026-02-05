import { Button } from "../ui/Button";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export function Contact() {
    return (
        <section id="contact" className="py-24 bg-white dark:bg-black transition-colors">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Left: Contact Info */}
                    <div>
                        <h2 className="text-base font-semibold text-teal-600 tracking-wide uppercase mb-4">Contact Us</h2>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                            Get in touch with our team
                        </h3>
                        <p className="text-lg text-gray-600 dark:text-zinc-400 mb-10 leading-relaxed font-medium">
                            Have questions about TangaCare? Interested in a custom enterprise demo? Fill out the form or reach out directly.
                        </p>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="h-12 w-12 bg-teal-50 dark:bg-teal-900/30 rounded-lg flex items-center justify-center text-teal-600 flex-shrink-0">
                                    <Mail className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">Email</h4>
                                    <p className="text-gray-600 dark:text-zinc-400 font-medium">hello@tangacare.io</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="h-12 w-12 bg-teal-50 dark:bg-teal-900/30 rounded-lg flex items-center justify-center text-teal-600 flex-shrink-0">
                                    <Phone className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">Phone</h4>
                                    <p className="text-gray-600 dark:text-zinc-400 font-medium">+1 (555) 123-4567</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="h-12 w-12 bg-teal-50 dark:bg-teal-900/30 rounded-lg flex items-center justify-center text-teal-600 flex-shrink-0">
                                    <MapPin className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">Office</h4>
                                    <p className="text-gray-600 dark:text-zinc-400 font-medium leading-relaxed">123 Health Ave, Suite 100<br />San Francisco, CA 94103</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-slate-50 dark:bg-zinc-900 rounded-3xl p-8 border border-slate-200 dark:border-zinc-800 shadow-sm"
                    >
                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-zinc-300">Name</label>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all font-medium text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-zinc-300">Email</label>
                                    <input
                                        type="email"
                                        placeholder="john@example.com"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all font-medium text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-zinc-300">Organization</label>
                                <input
                                    type="text"
                                    placeholder="Pharmacy Name"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all font-medium text-gray-900 dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-zinc-300">Message</label>
                                <textarea
                                    rows={4}
                                    placeholder="Tell us about your needs..."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all font-medium text-gray-900 dark:text-white"
                                ></textarea>
                            </div>
                            <Button className="w-full py-6 rounded-xl bg-teal-600 hover:bg-teal-700 flex items-center justify-center gap-2 font-black text-lg shadow-lg shadow-teal-600/20 active:scale-95 transition-all">
                                Send Message
                                <Send className="h-5 w-5" />
                            </Button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

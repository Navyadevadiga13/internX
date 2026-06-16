// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { Search, MapPin, Star, Code, Palette, BarChart3, Megaphone, Heart, Cog, ArrowRight, Calendar, ChevronLeft, ChevronRight, Quote, Sparkles, Globe2, Briefcase, Target, BookOpen, GraduationCap } from 'lucide-react';
// import axios from 'axios';
// import { Instagram, Facebook, Youtube, Linkedin } from "lucide-react";


// interface Job {
//   _id: string;
//   title: string;
//   company: string;
//   location: string;
//   domain: string;
//   salary: number;
//   type: string;
//   createdAt: string;
//   image?: string;
// }

// // Determine API base URL based on environment
// const getApiBaseUrl = () => {
//   if (typeof window !== 'undefined') {
//     const hostname = window.location.hostname;

//     // Local development
//     if (hostname === 'localhost' || hostname === '127.0.0.1') {
//       return 'http://localhost:5006/api';
//     }

//     // Production URLs
//     if (hostname === 'internx.io' || hostname === 'www.internx.io') {
//       return 'https://api.internx.io/api';
//     }

//     // Vercel/Netlify deployments
//     if (hostname.includes('vercel.app') || hostname.includes('netlify.app')) {
//       return 'https://api.internx.io/api';
//     }

//     // Default to localhost for development
//     return 'http://localhost:5006/api';
//   }

//   return 'http://localhost:5006/api';
// };

// const API_BASE_URL = getApiBaseUrl();

// const Home = () => {

//   const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [isAutoSliding, setIsAutoSliding] = useState(true);
//   const [animateCards, setAnimateCards] = useState(false);
//   const [isVideoOpen, setIsVideoOpen] = useState(false); // set true to show video popup initially

//   const openVideo = () => setIsVideoOpen(true);
//   const closeVideo = () => setIsVideoOpen(false);

//   const user = true; // Demo: set to false to show login buttons

//   const testimonials = [
//     {
//       name: 'Ananya R.',
//       location: 'Delhi',
//       quote: 'InternX helped me get my very first internship. I was nervous, but the platform made everything easy to understand and follow. I\'m really happy I found it.',
//       rating: 5
//     },
//     {
//       name: 'Karthik M.',
//       location: 'Bengaluru',
//       quote: 'Very simple and helpful website. I got selected for a remote internship within 10 days!',
//       rating: 5
//     },
//     {
//       name: 'Sneha D.',
//       location: 'Kochi',
//       quote: 'InternX gave me access to internships in different cities and fields. I found one in content writing and learned so many new things in just two months.',
//       rating: 4
//     },
//     {
//       name: 'Rahul V.',
//       location: 'Mumbai',
//       quote: 'I applied to 3 internships through InternX and got selected for one. The company was great, and I even got a certificate at the end.',
//       rating: 4
//     },
//     {
//       name: 'Megha S.',
//       location: 'Hyderabad',
//       quote: 'As a first-year student, I didn’t have much experience. But InternX still helped me get an internship that was beginner-friendly. I learned from scratch.',
//       rating: 5
//     },
//     {
//       name: 'Ajay N.',
//       location: 'Coimbatore',
//       quote: 'InternX is perfect for students who are new to internships. The steps are clear, and the website is easy to use.',
//       rating: 4
//     },
//     {
//       name: 'Priya K.',
//       location: 'Pune',
//       quote: 'The best thing is all internships are verified. I didn’t face any fake or unpaid work. Totally trustable platform!',
//       rating: 5
//     },
//     {
//       name: 'Zainab F.',
//       location: 'Bhopal',
//       quote: 'I’m from a small town, and I never thought I could work for a big company. InternX gave me that chance with a remote marketing internship. It changed my future.',
//       rating: 5
//     },
//     {
//       name: 'Saurabh R.',
//       location: 'Lucknow',
//       quote: 'This platform showed me options I didn’t even know existed. I applied to internships in graphic design, social media, and writing—all from one place.',
//       rating: 4
//     },
//     {
//       name: 'Divya L.',
//       location: 'Ahmedabad',
//       quote: 'My experience with InternX was really good. I found a company that treated interns with respect and helped me grow.',
//       rating: 5
//     },
//     {
//       name: 'Neha T.',
//       location: 'Chandigarh',
//       quote: 'InternX is not just a job board. It helps you grow. I improved my communication, learned new tools, and now I feel ready for the corporate world.',
//       rating: 5
//     },
//     {
//       name: 'Manish K.',
//       location: 'Jaipur',
//       quote: 'InternX is the reason I got selected for a paid internship. I was able to work, earn, and learn all at once. Very thankful!',
//       rating: 5
//     },
//     {
//       name: 'Ritika S.',
//       location: 'Nagpur',
//       quote: 'I love how InternX lets us filter by interest and city. That saved me so much time. Everything was well-organized.',
//       rating: 4
//     },
//     {
//       name: 'Naveen G.',
//       location: 'Visakhapatnam',
//       quote: 'Before using InternX, I had no idea where to begin. But this platform made everything so simple—from finding a role to preparing for interviews.',
//       rating: 5
//     },
//     {
//       name: 'Lavanya M.',
//       location: 'Mysuru',
//       quote: 'I found a fully remote internship through InternX and gained real work experience before graduating. It’s the best thing I did for my career.',
//       rating: 5
//     }
//   ];

//   const itemsPerSlide = 3;
//   const totalSlides = Math.ceil(testimonials.length / itemsPerSlide);

//   useEffect(() => {
//     fetchFeaturedJobs();
//   }, []);

//   useEffect(() => {
//     if (isAutoSliding) {
//       const interval = setInterval(() => {
//         setCurrentSlide((prev) => (prev + 1) % totalSlides);
//       }, 4000);
//       return () => clearInterval(interval);
//     }
//   }, [isAutoSliding, totalSlides]);
//   useEffect(() => {
//     setAnimateCards(false);  // reset if needed
//     const timer = setTimeout(() => {
//       setAnimateCards(true);
//     }, 50); // slight delay to trigger animation smoothly

//     return () => clearTimeout(timer);
//   }, []);
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsVideoOpen(true);
//     }, 5000); // 5000ms = 5 seconds

//     return () => clearTimeout(timer); // cleanup on unmount
//   }, []);
//   const fetchFeaturedJobs = async () => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/jobs?limit=6`);
//       const jobsWithImages = response.data.jobs.map((job: Job, index: number) => ({
//         ...job,
//         image: [
//           'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
//           'https://images.unsplash.com/photo-1516321497487-e288fb19713f',
//           'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
//           'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4',
//           'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
//           'https://images.unsplash.com/photo-1516321497487-e288fb19713f'
//         ][index % 6]
//       }));
//       setFeaturedJobs(jobsWithImages);
//     } catch (error) {
//       console.error('Error fetching featured jobs:', error);
//     }
//   };



//   // const handleDomainClick = (domain: string) => {
//   //   window.location.href = `/internships?domain=${encodeURIComponent(domain)}`;
//   // };

//   const nextSlide = () => {
//     setIsAutoSliding(false);
//     setCurrentSlide((prev) => (prev + 1) % totalSlides);
//     setTimeout(() => setIsAutoSliding(true), 10000);
//   };

//   const prevSlide = () => {
//     setIsAutoSliding(false);
//     setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
//     setTimeout(() => setIsAutoSliding(true), 10000);
//   };

//   const getCurrentSlideTestimonials = () => {
//     const startIndex = currentSlide * itemsPerSlide;
//     return testimonials.slice(startIndex, startIndex + itemsPerSlide);
//   };

//   const domains = [
//     {
//       name: 'Technology',
//       icon: Code,
//       description: 'Software Development, AI, Data Science',
//       color: 'from-blue-500 to-blue-600',
//       bgColor: 'bg-blue-50',
//       count: '150+'
//     },
//     {
//       name: 'Design',
//       icon: Palette,
//       description: 'UI/UX, Graphic Design, Product Design',
//       color: 'from-purple-500 to-purple-600',
//       bgColor: 'bg-purple-50',
//       count: '80+'
//     },
//     {
//       name: 'Marketing',
//       icon: Megaphone,
//       description: 'Digital Marketing, Content, Social Media',
//       color: 'from-pink-500 to-pink-600',
//       bgColor: 'bg-pink-50',
//       count: '120+'
//     },
//     {
//       name: 'Finance',
//       icon: BarChart3,
//       description: 'Investment Banking, Accounting, Analysis',
//       color: 'from-green-500 to-green-600',
//       bgColor: 'bg-green-50',
//       count: '90+'
//     },
//     {
//       name: 'Healthcare',
//       icon: Heart,
//       description: 'Medical Research, Pharmacy, Biotech',
//       color: 'from-red-500 to-red-600',
//       bgColor: 'bg-red-50',
//       count: '60+'
//     },
//     {
//       name: 'Engineering',
//       icon: Cog,
//       description: 'Mechanical, Civil, Electrical Engineering',
//       color: 'from-gray-500 to-gray-600',
//       bgColor: 'bg-gray-50',
//       count: '100+'
//     }
//   ];


//   return (

//     <div className="min-h-screen bg-gray-50">

//       {/* Hero Section */}
//       < div className="relative min-h-screen bg-white overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-green-50"></div>
//         <div className="absolute inset-0 overflow-hidden opacity-30">
//           <div className="absolute top-20 right-20 w-64 h-64 rounded-full" style={{ background: 'linear-gradient(135deg, rgba(12, 117, 69, 0.1), rgba(38, 131, 14, 0.05))' }}></div>
//           <div className="absolute bottom-32 left-20 w-48 h-48 rounded-full" style={{ background: 'linear-gradient(135deg, rgba(38, 131, 14, 0.08), rgba(12, 117, 69, 0.03))' }}></div>
//         </div>

//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-24 relative z-10">

//           <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[70vh]">
//             <div className="space-y-6 animate-fade-in-up">
//               <div className="mt-0 pt-0 ">
//                 <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-gray-900">
//                   Find Your
//                   <span className="block">
//                     <span
//                       style={{
//                         background: 'linear-gradient(135deg, #09D177, #26830E)',
//                         WebkitBackgroundClip: 'text',
//                         WebkitTextFillColor: 'transparent',
//                         backgroundClip: 'text',
//                       }}
//                     >
//                       Dream Internship
//                     </span>
//                     <span className="block text-red-600 text-4xl sm:text-5xl lg:text-6xl max-w-max font-bold">
//                       For Free
//                     </span>

//                   </span>
//                 </h1>
//               </div>

//               <p className="text-lg sm:text-xl text-gray-600 max-w-2xl leading-relaxed">
//                 Discover amazing internship opportunities from global companies and kickstart your career journey with the perfect match for your skills and aspirations.
//               </p>



//               <div className="flex flex-col sm:flex-row gap-4">
//                 {!user && (
//                   <>
//                     <Link
//                       to="/register"
//                       className="group inline-flex items-center justify-center px-6 py-3 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
//                       style={{ background: 'linear-gradient(135deg, #169244, #156935)' }}
//                     >
//                       Start Your Journey
//                       <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
//                     </Link>
//                     <Link
//                       to="/signin"
//                       className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 hover:scale-105 transition-all duration-300"
//                     >
//                       Sign In
//                     </Link>
//                   </>
//                 )}
//               </div>


//             </div>



//             {/* Your Button and Stats Block */}
//             <div className="w-full flex flex-col items-stretch animate-fade-in-up pr-4 mt-0 pt-0" style={{ marginTop: '-3.3rem' }}>
//               {/* Button – minimal spacing above */}
//               <Link
//                 to="/internships"
//                 className="group inline-flex items-center justify-center px-6 py-3 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 mt-0"
//                 style={{ background: 'linear-gradient(135deg, #169244, #156935)' }}
//               >
//                 Explore All Internships
//                 <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
//               </Link>

//               {/* Stats row – add margin-top to separate from button */}
//               <div className="flex flex-col sm:flex-row gap-6 mt-4 mb-8 w-full lg:justify-end">
//                 <div className="text-center flex-1">
//                   <div className="text-2xl sm:text-3xl font-bold text-gray-900">20000+</div>
//                   <div className="text-sm text-gray-600">Active Internships</div>
//                 </div>
//                 <div className="text-center flex-1">
//                   <div className="text-2xl sm:text-3xl font-bold text-gray-900">2000+</div>
//                   <div className="text-sm text-gray-600">Companies</div>
//                 </div>
//                 <div className="text-center flex-1">
//                   <div className="text-2xl sm:text-3xl font-bold text-gray-900">200+</div>
//                   <div className="text-sm text-gray-600">Cities</div>
//                 </div>

//               </div>




//             </div>

//             {/* Place this block just below stats section inside your return JSX */}






//           </div>
//           {isVideoOpen && (
//             <div
//               className="
//     fixed bottom-24 right-3
//     w-60 sm:w-72 md:w-80 lg:w-[24rem]
//     bg-white shadow-lg z-50 flex flex-col overflow-hidden border border-black
//   "
//               style={{
//                 boxShadow: '2px 2px 15px rgba(0, 0, 0, 0.3)',
//               }}
//             >
//               <div className="relative w-full aspect-video overflow-hidden">
//                 {/* Close Button */}
//                 <button
//                   onClick={closeVideo}
//                   aria-label="Close Video"
//                   className="
//         absolute top-1 right-1 text-black opacity-75 hover:opacity-100 transition-opacity text-2xl font-bold z-30
//         w-7 h-7 rounded-full flex items-center justify-center cursor-pointer border-none
//       "
//                 >
//                   &times;
//                 </button>
//                 <iframe
//                   width="100%"
//                   height="100%"
//                   src="https://www.youtube.com/embed/flqPFAQuKuY?autoplay=1&mute=1&modestbranding=1&rel=0&loop=1&playlist=flqPFAQuKuY"
//                   title="InternX Introduction Video"
//                   frameBorder="0"
//                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                   allowFullScreen
//                   className="absolute top-0 left-0 w-full h-full"
//                   style={{
//                     display: 'block',
//                     border: 'none',
//                     outline: 'none',
//                     margin: 0,
//                     padding: 0,
//                     background: 'transparent',
//                   }}
//                 />

//                 <div
//                   className="absolute bottom-2 left-2 text-black text-xs px-2 py-1 font-bold pointer-events-none select-none"
//                   style={{ letterSpacing: '0.03em', background: 'transparent' }}
//                 >
//                   A Beginner's Guide to InternX
//                 </div>
//               </div>
//             </div>






//           )}


//           {/* AI-Powered Features Block UP (moved here) */}
//           <div className="relative bg-gray-50 border-t border-gray-200 py-15 mx-4 rounded-t-2xl mt-4 z-20 max-w-6xl mx-auto">

//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
//               {[
//                 { icon: Search, title: "AI-Powered Matching", desc: "Smart algorithms find your perfect fit" },
//                 { icon: MapPin, title: "Global Internships", desc: "Remote and on-site positions worldwide" },
//                 { icon: Calendar, title: "Flexible Schedules", desc: "Part-time, full-time, and custom durations" },
//                 { icon: Briefcase, title: "One-Click Apply", desc: "Streamlined application process" }
//               ].map((feature, index) => (
//                 <div key={index} className="group text-center space-y-4 p-4 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:scale-105">
//                   <div className="w-14 h-14 mx-auto bg-white border border-gray-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
//                     <feature.icon className="w-6 h-6 text-green-600" />
//                   </div>
//                   <div>
//                     <h3 className="text-gray-900 font-semibold text-base sm:text-lg mb-2">{feature.title}</h3>
//                     <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//           {/*5 cards with link */}
//           <div
//             className={`mt-12 flex flex-col sm:flex-row flex-wrap gap-4 justify-center
//     transition-transform duration-700 ease-in-out
//     ${animateCards ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
//           >
//             {/* Card #1 */}
//             <Link to="/internships" className="w-full sm:flex-1 sm:max-w-xs">
//               <div className="p-4 rounded-xl bg-white text-center shadow ring-1 ring-green-200 hover:ring-2 hover:ring-green-400 flex flex-col items-center cursor-pointer hover:shadow-lg transition-shadow transition-transform duration-300">
//                 <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-400 via-yellow-300 to-lime-400 flex items-center justify-center mb-2 shadow-md">
//                   <Globe2 className="w-7 h-7 text-white" />
//                 </div>
//                 <span className="text-xl font-semibold text-gray-900">Explore Global Internships</span>
//               </div>
//             </Link>

//             {/* Card #2 */}
//             <Link to="/Global-jobs" className="w-full sm:flex-1 sm:max-w-xs">
//               <div className="p-4 rounded-xl bg-white text-center shadow ring-1 ring-green-200 hover:ring-2 hover:ring-green-400 flex flex-col items-center cursor-pointer hover:shadow-lg transition-shadow transition-transform duration-300">
//                 <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-400 via-pink-400 to-purple-400 flex items-center justify-center mb-2 shadow-md">
//                   <Briefcase className="w-7 h-7 text-white" />
//                 </div>
//                 <span className="text-xl font-semibold text-gray-900">Explore Global Job Sites</span>
//               </div>
//             </Link>

//             {/* Card #3 */}
//             <a href="https://wiztest.org/" target="_blank" rel="noopener noreferrer" className="w-full sm:flex-1 sm:max-w-xs">
//               <div className="p-4 rounded-xl bg-white text-center shadow ring-1 ring-green-200 hover:ring-2 hover:ring-green-400 flex flex-col items-center cursor-pointer hover:shadow-lg transition-shadow transition-transform duration-300">
//                 <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-teal-400 via-fuchsia-400 to-yellow-300 flex items-center justify-center mb-2 shadow-md">
//                   <Target className="w-7 h-7 text-white" />
//                 </div>
//                 <span className="text-xl font-semibold text-gray-900">Explore Competitive Exams</span>
//               </div>
//             </a>

//             {/* Card #4 */}
//             <a href="https://student.wizx.org/sign-up" target="_blank" rel="noopener noreferrer" className="w-full sm:flex-1 sm:max-w-xs">
//               <div className="p-4 rounded-xl bg-white text-center shadow ring-1 ring-green-200 hover:ring-2 hover:ring-green-400 flex flex-col items-center cursor-pointer hover:shadow-lg transition-shadow transition-transform duration-300">
//                 <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-violet-400 via-sky-400 to-indigo-400 flex items-center justify-center mb-2 shadow-md">
//                   <BookOpen className="w-7 h-7 text-white" />
//                 </div>
//                 <span className="text-xl font-semibold text-gray-900">Explore Global Courses</span>
//               </div>
//             </a>

//             {/* Card #5 */}
//             <a href="https://www.scholarx.in/" target="_blank" rel="noopener noreferrer" className="w-full sm:flex-1 sm:max-w-xs">
//               <div className="p-4 rounded-xl bg-white text-center shadow ring-1 ring-green-200 hover:ring-2 hover:ring-green-400 flex flex-col items-center cursor-pointer hover:shadow-lg transition-shadow transition-transform duration-300">
//                 <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-400 via-green-400 to-emerald-400 flex items-center justify-center mb-2 shadow-md">
//                   <GraduationCap className="w-7 h-7 text-white" />
//                 </div>
//                 <span className="text-xl font-semibold text-gray-900">Explore Global Scholarships</span>
//               </div>
//             </a>
//           </div>

//         </div>

//         <style jsx>{`
//           @keyframes fade-in-up {
//             from { opacity: 0; transform: translateY(30px); }
//             to { opacity: 1; transform: translateY(0); }
//           }
//           .animate-fade-in-up {
//             animation: fade-in-up 0.8s ease-out forwards;
//           }
//         `}</style>
//       </div>

//       {/* Domain Categories */}
//       <section className="py-16 px-4 bg-gray-50">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center mb-10">
//             <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Popular Domains</h2>
//             <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
//            Find your perfect internship fit in exciting domains
//             </p>
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {domains.map((domain, index) => (
//            <div
//   key={index}
//   className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-green-100 backdrop-blur-sm"
// >
//                 <div className={`bg-gradient-to-r ${domain.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
//                   <domain.icon className="h-6 w-6 text-white" />
//                 </div>
//                 <div className="flex items-center justify-between mb-3">
//                   <h3 className="text-xl font-bold text-gray-900">{domain.name}</h3>
//                   <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
//                     {domain.count}
//                   </span>
//                 </div>
//                 <p className="text-gray-600 text-sm mb-4">{domain.description}</p>
//                 <div className="flex items-center text-green-700 font-medium group-hover:text-green-800 transition-colors">
//                   {/* <span>Discover Now</span> */}
//                   {/* <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /> */}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Featured Jobs */}
//       <section className="py-16 px-4 bg-white">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center mb-10">
//             <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Featured Internships</h2>
//             <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
//               Explore curated Internships from leading global companies
//             </p>
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {featuredJobs.map((job) => (
//               <div
//                 key={job._id}
//                 className="bg-white border border-green-100 rounded-xl p-5 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 backdrop-blur-sm"
//               >
//                 <div className="relative mb-4">
//                   <img
//                     src={job.image}
//                     alt={job.title}
//                     className="w-full h-36 object-cover rounded-lg"
//                   />
//                   {/* "Featured" sticker */}
//                   <div className="absolute top-2 left-2 bg-white text-green-700 border border-green-300 text-[0.85rem] px-2 py-1 rounded-full font-semibold shadow select-none pointer-events-none z-10 uppercase tracking-wide">
//                     Featured
//                   </div>

//                   <div className="absolute top-2 right-2 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
//                     {job.type}
//                   </div>
//                 </div>
//                 <h3 className="text-lg font-bold text-gray-900 mb-2">{job.title}
                  
//                 </h3>
                
//                 <p className="text-gray-600 text-sm mb-2">{job.company}</p>
//                 <div className="flex items-center text-gray-500 mb-4">
//                   <MapPin className="h-4 w-4 mr-1" />
//                   <span className="text-sm">{job.location}</span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-xl font-bold text-green-700">
//                     {job.salary.toLocaleString()}
//                   </span>
//                   <Link
//                     to={`/internships/${job._id}`}
//                     className="bg-green-600 hover:bg-green-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
//                   >
//                     View Details
//                   </Link>
//                 </div>
//               </div>
//             ))}

//           </div>
//           <div className="text-center mt-16 sm:mt-10">
//             <Link
//               to="/internships"
//               className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-800 hover:to-green-900 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
//             >
//               Explore All Internships
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* Testimonials Section */}
//       <section className="py-24 px-4 bg-gradient-to-br from-gray-50 via-white to-green-50 overflow-hidden relative">
//         <div className="absolute inset-0 opacity-30">
//           <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-green-100/40 to-green-200/20 rounded-full blur-3xl"></div>
//           <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-emerald-100/40 to-emerald-200/20 rounded-full blur-3xl"></div>
//         </div>

//         <div className="max-w-7xl mx-auto relative z-10">
//           <div className="text-center mb-20">
//             <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-full text-green-700 text-sm font-medium mb-6 shadow-lg backdrop-blur-sm">
//               <Star className="w-4 h-4 mr-9 text-green-600 fill-green-600" />
//               Trusted by 15,000+ Students Across India
//             </div>
//             <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-gray-900 via-green-900 to-gray-900 bg-clip-text text-transparent">
//               Success Stories
//             </h2>
//             <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
//               Discover how students from across India transformed their careers with InternX
//             </p>
//           </div>

//           <div className="relative">
//             <button
//               onClick={prevSlide}
//               className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-14 h-14 bg-white/90 backdrop-blur-sm hover:bg-white border border-green-200/50 rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 group hover:scale-110"
//               aria-label="Previous testimonials"
//             >
//               <ChevronLeft className="w-6 h-6 text-green-600 group-hover:text-green-700 transition-colors" />
//             </button>
//             <button
//               onClick={nextSlide}
//               className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-14 h-14 bg-white/90 backdrop-blur-sm hover:bg-white border border-green-200/50 rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 group hover:scale-110"
//               aria-label="Next testimonials"
//             >
//               <ChevronRight className="w-6 h-6 text-green-600 group-hover:text-green-700 transition-colors" />
//             </button>

//             <div className="overflow-hidden px-8">
//               <div
//                 className="flex transition-transform duration-700 ease-in-out"
//                 style={{ transform: `translateX(-${currentSlide * 100}%)` }}
//               >
//                 {Array.from({ length: totalSlides }).map((_, slideIndex) => (
//                   <div key={slideIndex} className="min-w-full">
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//                       {getCurrentSlideTestimonials().map((testimonial, index) => (
//                         <div
//                           key={`${slideIndex}-${index}`}
//                           className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-green-100/50 hover:border-green-200/50 transform hover:-translate-y-2 hover:scale-[1.02]"
//                         >
//                           <div className="absolute -top-0 -left-4 w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
//                             <Quote className="w-6 h-6 text-white" />
//                           </div>
//                           <div className="flex mb-6 justify-center">
//                             {[...Array(testimonial.rating)].map((_, i) => (
//                               <Star
//                                 key={i}
//                                 className="w-5 h-5 text-amber-400 fill-amber-400 mr-1 group-hover:scale-110 transition-transform"
//                                 style={{ transitionDelay: `${i * 50}ms` }}
//                               />
//                             ))}
//                           </div>
//                           <blockquote className="text-gray-700 leading-relaxed mb-6 text-center italic font-medium">
//                             "{testimonial.quote}"
//                           </blockquote>
//                           <div className="text-center">
//                             <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
//                               <span className="text-2xl font-bold text-green-700">
//                                 {testimonial.name.charAt(0)}
//                               </span>
//                             </div>
//                             <h4 className="text-lg font-bold text-gray-900 mb-1">
//                               {testimonial.name}
//                             </h4>
//                             <p className="text-sm text-green-600 font-medium">
//                               {testimonial.location}
//                             </p>
//                           </div>
//                           <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="flex justify-center mt-12 space-x-3">
//               {Array.from({ length: totalSlides }).map((_, index) => (
//                 <button
//                   key={index}
//                   onClick={() => {
//                     setCurrentSlide(index);
//                     setIsAutoSliding(false);
//                     setTimeout(() => setIsAutoSliding(true), 10000);
//                   }}
//                   className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
//                     ? 'bg-gradient-to-r from-green-500 to-green-600 scale-125 shadow-lg'
//                     : 'bg-green-200 hover:bg-green-300 hover:scale-110'
//                     }`}
//                   aria-label={`Go to slide ${index + 1}`}
//                 />
//               ))}
//             </div>
//           </div>

         
//         </div>

//         <div className="absolute inset-0 pointer-events-none overflow-hidden">
//           <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-green-400 rounded-full animate-pulse opacity-60"></div>
//           <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-emerald-400 rounded-full animate-pulse opacity-40" style={{ animationDelay: '1s' }}></div>
//           <div className="absolute top-1/2 left-3/4 w-1 h-1 bg-green-500 rounded-full animate-pulse opacity-80" style={{ animationDelay: '2s' }}></div>
//         </div>
//       </section>

//       {/* How It Works */}
//       <section className="py-16 px-4 bg-white">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center mb-10">
//             <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Your Journey Starts Here</h2>
//             <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
//               Three simple steps to kickstart your internship adventure
//             </p>
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//             <div className="text-center group">
//               <div className="bg-gradient-to-r from-green-600 to-green-800 text-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold group-hover:scale-110 transition-transform">
//                 1
//               </div>
//               <h3 className="text-xl font-bold text-gray-900 mb-3">Build Profile</h3>
//               <p className="text-gray-600 text-sm">Create a standout profile showcasing your skills and experience</p>
//             </div>
//             <div className="text-center group">
//               <div className="bg-gradient-to-r from-green-600 to-green-800 text-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold group-hover:scale-110 transition-transform">
//                 2
//               </div>
//               <h3 className="text-xl font-bold text-gray-900 mb-3">Discover Internships</h3>
//               <p className="text-gray-600 text-sm">Explore tailored internship opportunities that match your goals</p>
//             </div>
//             <div className="text-center group">
//               <div className="bg-gradient-to-r from-green-600 to-green-800 text-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold group-hover:scale-110 transition-transform">
//                 3
//               </div>
//               <h3 className="text-xl font-bold text-gray-900 mb-3">Get Started</h3>
//               <p className="text-gray-600 text-sm">Apply effortlessly and connect with top employers</p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="py-16 px-4 bg-gradient-to-r from-green-600 to-green-800">
//         <div className="max-w-4xl mx-auto text-center">
//           <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to Shape Your Future?</h2>
//           <p className="text-lg sm:text-xl text-white/90 mb-8">Join thousands of students who have launched their careers with us</p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">

//             <Link
//               to="/internships"
//               className="border-2 border-white text-white hover:bg-white hover:text-green-700 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
//             >
//               Browse Opportunities
//             </Link>
//           </div>
//         </div>
//       </section>
//       {/* Footer */}
//       <footer className="bg-gray-950 text-white py-8 px-4 relative overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-br from-[#15803D]/20 to-transparent opacity-50"></div>
//         <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
//           <div className="col-span-1 sm:col-span-2 lg:col-span-1">
//             <div className="flex flex-col items-center sm:items-start">
//               <img
//                 src="/internx-logo-white.png"
//                 alt="InternX Logo"
//                 className="h-24 w-24 sm:h-32 sm:w-32 lg:h-40 lg:w-40 object-contain mb-4"
//               />
//               <p className="text-gray-200 text-sm leading-relaxed max-w-xs text-center sm:text-left">
//                 Empowering career growth through global internship opportunities at InternX, a WiZdomEd initiative based in Mangalore, Karnataka.
//               </p>
//             </div>
//           </div>

//           <div>
//             <h3 className="text-lg font-semibold mb-4 text-white text-center sm:text-left">Quick Links</h3>
//             <ul className="space-y-2 text-center sm:text-left">
//               <li><Link to="/about" className="text-gray-200 hover:text-[#15803D] transition-all duration-300 ease-in-out hover:translate-x-1 block">About InternX</Link></li>
//               <li><Link to="https://www.wizx.org/" className="text-gray-200 hover:text-[#15803D] transition-all duration-300 ease-in-out hover:translate-x-1 block">About WiZdomEd</Link></li>
//               <li><Link to="/internships" className="text-gray-200 hover:text-[#15803D] transition-all duration-300 ease-in-out hover:translate-x-1 block">InternX Opportunities</Link></li>
//               <li><Link to="/login" className="text-gray-200 hover:text-[#15803D] transition-all duration-300 ease-in-out hover:translate-x-1 block">Sign In to InternX</Link></li>
//             </ul>
//           </div>

//           <div>
//             <h3 className="text-lg font-semibold mb-4 text-white text-center sm:text-left">Contact</h3>
//             <div className="text-center sm:text-left">
//               <p className="text-gray-200 text-sm mb-2">Email: <a href="mailto:hello@internx.in" className="hover:text-[#15803D] transition-colors">hello@internx.in</a></p>
//               <p className="text-gray-200 text-sm mb-2">Phone: <a href="tel:+91918431220992" className="hover:text-[#15803D] transition-colors">+91 918431220992</a></p>
//               <p className="text-gray-200 text-sm">Inland Ornate Building, Navabharath Cir, Kodailbail, Mangaluru, Karnataka 575003</p>
//             </div>
//           </div>

//           <div>
//             <h3 className="text-lg font-semibold mb-4 text-white text-center sm:text-left">Follow WiZdomEd</h3>
//             <div className="flex space-x-4 justify-center sm:justify-start">
//               <a href="https://www.facebook.com/Wizdom.ed" target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-[#15803D] transition-all duration-300 transform hover:scale-110">
//                 <Facebook className="w-6 h-6" aria-label="Facebook" />
//               </a>
//               <a href="https://youtube.com/@wizdominstitutionsnetwork?si=IkoTqfjzqQXQWqB6" target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-[#15803D] transition-all duration-300 transform hover:scale-110">
//                 <Youtube className="w-6 h-6" aria-label="Youtube" />
//               </a>
//               <a href="https://www.linkedin.com/company/65612472/" target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-[#15803D] transition-all duration-300 transform hover:scale-110">
//                 <Linkedin className="w-6 h-6" aria-label="LinkedIn" />
//               </a>
//               <a href="https://www.instagram.com/wizdom.ed/" target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-[#15803D] transition-all duration-300 transform hover:scale-110">
//                 <Instagram className="w-6 h-6" aria-label="Instagram" />
//               </a>
//             </div>
//           </div>
//         </div>

//         <div className="mt-8 pt-6 border-t border-gray-800 text-center text-gray-200 relative z-10">
//           <p className="text-sm">© {new Date().getFullYear()} WiZdomEd's InternX. All rights reserved.</p>
//         </div>

//         <div className="absolute inset-0 pointer-events-none">
//           <div className="w-2 h-2 bg-[#15803D] rounded-full absolute top-10 left-20 animate-[float_4s_ease-in-out_infinite]"></div>
//           <div className="w-3 h-3 bg-[#15803D]/50 rounded-full absolute bottom-20 right-10 animate-[float_4s_ease-in-out_infinite_1s]"></div>
//           <div className="w-1 h-1 bg-[#15803D]/70 rounded-full absolute top-1/2 left-1/3 animate-[float_4s_ease-in-out_infinite_0.5s]"></div>
//         </div>
//       </footer>


//     </div>
//   );
// };

// export default Home;




import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, Code, Palette, BarChart3, Megaphone, Heart, Cog, ArrowRight, Calendar, ChevronLeft, ChevronRight, Quote, Sparkles, Globe2, Briefcase, Target, BookOpen, GraduationCap } from 'lucide-react';
import axios from 'axios';
import { Instagram, Facebook, Youtube, Linkedin } from "lucide-react";


interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  domain: string;
  salary: number;
  type: string;
  createdAt: string;
  image?: string;
}

// Determine API base URL based on environment
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5006/api';
    }

    // Production URLs
    if (hostname === 'internx.cc' || hostname === 'www.internx.cc') {
      return 'https://api.internx.cc/api';
    }

    // Vercel/Netlify deployments
    if (hostname.includes('vercel.app') || hostname.includes('netlify.app')) {
      return 'https://api.internx.cc/api';
    }

    // Default to localhost for development
    return 'http://localhost:5006/api';
  }

  return 'http://localhost:5006/api';
};

const API_BASE_URL = getApiBaseUrl();

const Home = () => {

  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoSliding, setIsAutoSliding] = useState(true);
  const [animateCards, setAnimateCards] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false); // set true to show video popup initially
  const [showPopup, setShowPopup] = useState(true);

  const openVideo = () => setIsVideoOpen(true);
  const closeVideo = () => setIsVideoOpen(false);

  const user = true; // Demo: set to false to show login buttons

  const testimonials = [
    {
      name: 'Ananya R.',
      location: 'Delhi',
      quote: 'InternX helped me get my very first internship. I was nervous, but the platform made everything easy to understand and follow. I\'m really happy I found it.',
      rating: 5
    },
    {
      name: 'Karthik M.',
      location: 'Bengaluru',
      quote: 'Very simple and helpful website. I got selected for a remote internship within 10 days!',
      rating: 5
    },
    {
      name: 'Sneha D.',
      location: 'Kochi',
      quote: 'InternX gave me access to internships in different cities and fields. I found one in content writing and learned so many new things in just two months.',
      rating: 4
    },
    {
      name: 'Rahul V.',
      location: 'Mumbai',
      quote: 'I applied to 3 internships through InternX and got selected for one. The company was great, and I even got a certificate at the end.',
      rating: 4
    },
    {
      name: 'Megha S.',
      location: 'Hyderabad',
      quote: 'As a first-year student, I didn’t have much experience. But InternX still helped me get an internship that was beginner-friendly. I learned from scratch.',
      rating: 5
    },
    {
      name: 'Ajay N.',
      location: 'Coimbatore',
      quote: 'InternX is perfect for students who are new to internships. The steps are clear, and the website is easy to use.',
      rating: 4
    },
    {
      name: 'Priya K.',
      location: 'Pune',
      quote: 'The best thing is all internships are verified. I didn’t face any fake or unpaid work. Totally trustable platform!',
      rating: 5
    },
    {
      name: 'Zainab F.',
      location: 'Bhopal',
      quote: 'I’m from a small town, and I never thought I could work for a big company. InternX gave me that chance with a remote marketing internship. It changed my future.',
      rating: 5
    },
    {
      name: 'Saurabh R.',
      location: 'Lucknow',
      quote: 'This platform showed me options I didn’t even know existed. I applied to internships in graphic design, social media, and writing—all from one place.',
      rating: 4
    },
    {
      name: 'Divya L.',
      location: 'Ahmedabad',
      quote: 'My experience with InternX was really good. I found a company that treated interns with respect and helped me grow.',
      rating: 5
    },
    {
      name: 'Neha T.',
      location: 'Chandigarh',
      quote: 'InternX is not just a job board. It helps you grow. I improved my communication, learned new tools, and now I feel ready for the corporate world.',
      rating: 5
    },
    {
      name: 'Manish K.',
      location: 'Jaipur',
      quote: 'InternX is the reason I got selected for a paid internship. I was able to work, earn, and learn all at once. Very thankful!',
      rating: 5
    },
    {
      name: 'Ritika S.',
      location: 'Nagpur',
      quote: 'I love how InternX lets us filter by interest and city. That saved me so much time. Everything was well-organized.',
      rating: 4
    },
    {
      name: 'Naveen G.',
      location: 'Visakhapatnam',
      quote: 'Before using InternX, I had no idea where to begin. But this platform made everything so simple—from finding a role to preparing for interviews.',
      rating: 5
    },
    {
      name: 'Lavanya M.',
      location: 'Mysuru',
      quote: 'I found a fully remote internship through InternX and gained real work experience before graduating. It’s the best thing I did for my career.',
      rating: 5
    }
  ];

  const itemsPerSlide = 3;
  const totalSlides = Math.ceil(testimonials.length / itemsPerSlide);

  useEffect(() => {
    fetchFeaturedJobs();
  }, []);
useEffect(() => {
  const hasSeenPopup = sessionStorage.getItem("internx_notice_seen");

  if (hasSeenPopup) {
    setShowPopup(false);
  }
}, []);

  useEffect(() => {
    if (isAutoSliding) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isAutoSliding, totalSlides]);
  useEffect(() => {
    setAnimateCards(false);  // reset if needed
    const timer = setTimeout(() => {
      setAnimateCards(true);
    }, 50); // slight delay to trigger animation smoothly

    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVideoOpen(true);
    }, 5000); // 5000ms = 5 seconds

    return () => clearTimeout(timer); // cleanup on unmount
  }, []);
  const fetchFeaturedJobs = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs?limit=6`);
      const jobsWithImages = response.data.jobs.map((job: Job, index: number) => ({
        ...job,
        image: [
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
          'https://images.unsplash.com/photo-1516321497487-e288fb19713f',
          'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
          'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4',
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
          'https://images.unsplash.com/photo-1516321497487-e288fb19713f'
        ][index % 6]
      }));
      setFeaturedJobs(jobsWithImages);
    } catch (error) {
      console.error('Error fetching featured jobs:', error);
    }
  };



  // const handleDomainClick = (domain: string) => {
  //   window.location.href = `/internships?domain=${encodeURIComponent(domain)}`;
  // };

  const nextSlide = () => {
    setIsAutoSliding(false);
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
    setTimeout(() => setIsAutoSliding(true), 10000);
  };

  const prevSlide = () => {
    setIsAutoSliding(false);
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    setTimeout(() => setIsAutoSliding(true), 10000);
  };

  const getCurrentSlideTestimonials = () => {
    const startIndex = currentSlide * itemsPerSlide;
    return testimonials.slice(startIndex, startIndex + itemsPerSlide);
  };

  const domains = [
    {
      name: 'Technology',
      icon: Code,
      description: 'Software Development, AI, Data Science',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      count: '150+'
    },
    {
      name: 'Design',
      icon: Palette,
      description: 'UI/UX, Graphic Design, Product Design',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      count: '80+'
    },
    {
      name: 'Marketing',
      icon: Megaphone,
      description: 'Digital Marketing, Content, Social Media',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      count: '120+'
    },
    {
      name: 'Finance',
      icon: BarChart3,
      description: 'Investment Banking, Accounting, Analysis',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      count: '90+'
    },
    {
      name: 'Healthcare',
      icon: Heart,
      description: 'Medical Research, Pharmacy, Biotech',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      count: '60+'
    },
    {
      name: 'Engineering',
      icon: Cog,
      description: 'Mechanical, Civil, Electrical Engineering',
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-50',
      count: '100+'
    }
  ];


  return (

    <div className="min-h-screen bg-gray-50">
{showPopup && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md">
    <div className="relative bg-white/80 backdrop-blur-xl border border-white/40 max-w-lg w-[90%] rounded-3xl shadow-2xl p-8 text-center">

      <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">
        Important Notice
      </h2>

      <p className="text-gray-700 text-sm leading-relaxed mb-6">
        InternX curates internship opportunities through independent research
        using publicly available information from verified sources.
        <br /><br />
        While we strive to connect students with genuine opportunities,
        <span className="font-semibold text-gray-900">
          {" "}InternX does not guarantee internship placement or selection outcomes.
        </span>
      </p>

      {/* Follow-up note */}
      <div className="flex items-start gap-3 bg-white/60 border border-gray-200 rounded-xl p-4 mb-6 text-left">
        <span className="text-lg leading-none">📌</span>
        <p className="text-sm text-gray-600 leading-relaxed">
          If you do not receive a response from the company within
          <span className="font-semibold text-gray-800"> 5 working days</span>,
          you are encouraged to follow up directly with the company via
          <span className="font-semibold text-gray-800"> phone or email</span>.
        </p>
      </div>

      <button
        onClick={() => {
          sessionStorage.setItem("internx_notice_seen", "true");
          setShowPopup(false);
        }}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        Accept & Continue
      </button>

    </div>
  </div>
)}



      {/* Hero Section */}
      < div className="relative min-h-screen bg-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-green-50"></div>
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full" style={{ background: 'linear-gradient(135deg, rgba(12, 117, 69, 0.1), rgba(38, 131, 14, 0.05))' }}></div>
          <div className="absolute bottom-32 left-20 w-48 h-48 rounded-full" style={{ background: 'linear-gradient(135deg, rgba(38, 131, 14, 0.08), rgba(12, 117, 69, 0.03))' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-24 relative z-10">

          <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[70vh]">
            <div className="space-y-6 animate-fade-in-up">
              <div className="mt-0 pt-0 ">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-gray-900">
                  Find Your
                  <span className="block">
                    <span
                      style={{
                        background: 'linear-gradient(135deg, #09D177, #26830E)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      Dream Internship
                    </span>
                    <span className="block text-red-600 text-4xl sm:text-5xl lg:text-6xl max-w-max font-bold">
                      For Cost
                    </span>

                  </span>
                </h1>
              </div>

              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl leading-relaxed">
                Discover amazing internship opportunities from global companies and kickstart your career journey with the perfect match for your skills and aspirations.
              </p>



              <div className="flex flex-col sm:flex-row gap-4">
                {!user && (
                  <>
                    <Link
                      to="/register"
                      className="group inline-flex items-center justify-center px-6 py-3 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                      style={{ background: 'linear-gradient(135deg, #169244, #156935)' }}
                    >
                      Start Your Journey
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      to="/signin"
                      className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 hover:scale-105 transition-all duration-300"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>


            </div>



            {/* Your Button and Stats Block */}
            <div className="w-full flex flex-col items-stretch animate-fade-in-up pr-4 mt-0 pt-0" style={{ marginTop: '-3.3rem' }}>
              {/* Button – minimal spacing above */}
              <Link
                to="/internships"
                className="group inline-flex items-center justify-center px-6 py-3 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 mt-0"
                style={{ background: 'linear-gradient(135deg, #169244, #156935)' }}
              >
                Explore All Internships
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Stats row – add margin-top to separate from button */}
              <div className="flex flex-col sm:flex-row gap-6 mt-4 mb-8 w-full lg:justify-end">
                <div className="text-center flex-1">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">20000+</div>
                  <div className="text-sm text-gray-600">Active Internships</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">2000+</div>
                  <div className="text-sm text-gray-600">Companies</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">200+</div>
                  <div className="text-sm text-gray-600">Cities</div>
                </div>

              </div>




            </div>

            {/* Place this block just below stats section inside your return JSX */}






          </div>
          {isVideoOpen && (
            <div
              className="
    fixed bottom-24 right-3
    w-60 sm:w-72 md:w-80 lg:w-[24rem]
    bg-white shadow-lg z-50 flex flex-col overflow-hidden border border-black
  "
              style={{
                boxShadow: '2px 2px 15px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div className="relative w-full aspect-video overflow-hidden">
                {/* Close Button */}
                <button
                  onClick={closeVideo}
                  aria-label="Close Video"
                  className="
        absolute top-1 right-1 text-black opacity-75 hover:opacity-100 transition-opacity text-2xl font-bold z-30
        w-7 h-7 rounded-full flex items-center justify-center cursor-pointer border-none
      "
                >
                  &times;
                </button>
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/flqPFAQuKuY?autoplay=1&mute=1&modestbranding=1&rel=0&loop=1&playlist=flqPFAQuKuY"
                  title="InternX Introduction Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full"
                  style={{
                    display: 'block',
                    border: 'none',
                    outline: 'none',
                    margin: 0,
                    padding: 0,
                    background: 'transparent',
                  }}
                />

                <div
                  className="absolute bottom-2 left-2 text-black text-xs px-2 py-1 font-bold pointer-events-none select-none"
                  style={{ letterSpacing: '0.03em', background: 'transparent' }}
                >
                  A Beginner's Guide to InternX
                </div>
              </div>
            </div>






          )}


          {/* AI-Powered Features Block UP (moved here) */}
          <div className="relative bg-gray-50 border-t border-gray-200 py-15 mx-4 rounded-t-2xl mt-4 z-20 max-w-6xl mx-auto">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
              {[
                { icon: Search, title: "AI-Powered Matching", desc: "Smart algorithms find your perfect fit" },
                { icon: MapPin, title: "Global Internships", desc: "Remote and on-site positions worldwide" },
                { icon: Calendar, title: "Flexible Schedules", desc: "Part-time, full-time, and custom durations" },
                { icon: Briefcase, title: "One-Click Apply", desc: "Streamlined application process" }
              ].map((feature, index) => (
                <div key={index} className="group text-center space-y-4 p-4 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <div className="w-14 h-14 mx-auto bg-white border border-gray-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <feature.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-semibold text-base sm:text-lg mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/*5 cards with link */}
          <div
            className={`mt-12 flex flex-col sm:flex-row flex-wrap gap-4 justify-center
    transition-transform duration-700 ease-in-out
    ${animateCards ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
          >
            {/* Card #1 */}
            <Link to="/internships" className="w-full sm:flex-1 sm:max-w-xs">
              <div className="p-4 rounded-xl bg-white text-center shadow ring-1 ring-green-200 hover:ring-2 hover:ring-green-400 flex flex-col items-center cursor-pointer hover:shadow-lg transition-shadow transition-transform duration-300">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-400 via-yellow-300 to-lime-400 flex items-center justify-center mb-2 shadow-md">
                  <Globe2 className="w-7 h-7 text-white" />
                </div>
                <span className="text-xl font-semibold text-gray-900">Explore Global Internships</span>
              </div>
            </Link>

            {/* Card #2 */}
            <Link to="/Global-jobs" className="w-full sm:flex-1 sm:max-w-xs">
              <div className="p-4 rounded-xl bg-white text-center shadow ring-1 ring-green-200 hover:ring-2 hover:ring-green-400 flex flex-col items-center cursor-pointer hover:shadow-lg transition-shadow transition-transform duration-300">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-400 via-pink-400 to-purple-400 flex items-center justify-center mb-2 shadow-md">
                  <Briefcase className="w-7 h-7 text-white" />
                </div>
                <span className="text-xl font-semibold text-gray-900">Explore Global Job Sites</span>
              </div>
            </Link>

            {/* Card #3 */}
            <a href="https://wiztest.org/" target="_blank" rel="noopener noreferrer" className="w-full sm:flex-1 sm:max-w-xs">
              <div className="p-4 rounded-xl bg-white text-center shadow ring-1 ring-green-200 hover:ring-2 hover:ring-green-400 flex flex-col items-center cursor-pointer hover:shadow-lg transition-shadow transition-transform duration-300">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-teal-400 via-fuchsia-400 to-yellow-300 flex items-center justify-center mb-2 shadow-md">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <span className="text-xl font-semibold text-gray-900">Explore Competitive Exams</span>
              </div>
            </a>

            {/* Card #4 */}
            <a href="https://student.wizx.org/sign-up" target="_blank" rel="noopener noreferrer" className="w-full sm:flex-1 sm:max-w-xs">
              <div className="p-4 rounded-xl bg-white text-center shadow ring-1 ring-green-200 hover:ring-2 hover:ring-green-400 flex flex-col items-center cursor-pointer hover:shadow-lg transition-shadow transition-transform duration-300">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-violet-400 via-sky-400 to-indigo-400 flex items-center justify-center mb-2 shadow-md">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <span className="text-xl font-semibold text-gray-900">Explore Global Courses</span>
              </div>
            </a>

            {/* Card #5 */}
            <a href="https://www.scholarx.in/" target="_blank" rel="noopener noreferrer" className="w-full sm:flex-1 sm:max-w-xs">
              <div className="p-4 rounded-xl bg-white text-center shadow ring-1 ring-green-200 hover:ring-2 hover:ring-green-400 flex flex-col items-center cursor-pointer hover:shadow-lg transition-shadow transition-transform duration-300">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-400 via-green-400 to-emerald-400 flex items-center justify-center mb-2 shadow-md">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <span className="text-xl font-semibold text-gray-900">Explore Global Scholarships</span>
              </div>
            </a>
          </div>

        </div>

        <style jsx>{`
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out forwards;
          }
        `}</style>
      </div>

      {/* Domain Categories */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Popular Domains</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
           Find your perfect internship fit in exciting domains
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {domains.map((domain, index) => (
           <div
  key={index}
  className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-green-100 backdrop-blur-sm"
>
                <div className={`bg-gradient-to-r ${domain.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <domain.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{domain.name}</h3>
                  <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {domain.count}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{domain.description}</p>
                <div className="flex items-center text-green-700 font-medium group-hover:text-green-800 transition-colors">
                  {/* <span>Discover Now</span> */}
                  {/* <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Featured Internships</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Explore curated Internships from leading global companies
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <div
                key={job._id}
                className="bg-white border border-green-100 rounded-xl p-5 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 backdrop-blur-sm"
              >
                <div className="relative mb-4">
                  <img
                    src={job.image}
                    alt={job.title}
                    className="w-full h-36 object-cover rounded-lg"
                  />
                  {/* "Featured" sticker */}
                  <div className="absolute top-2 left-2 bg-white text-green-700 border border-green-300 text-[0.85rem] px-2 py-1 rounded-full font-semibold shadow select-none pointer-events-none z-10 uppercase tracking-wide">
                    Featured
                  </div>

                  <div className="absolute top-2 right-2 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                    {job.type}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{job.title}
                  
                </h3>
                
                <p className="text-gray-600 text-sm mb-2">{job.company}</p>
                <div className="flex items-center text-gray-500 mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{job.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-green-700">
                    {job.salary.toLocaleString()}
                  </span>
                  <Link
                    to={`/internships/${job._id}`}
                    className="bg-green-600 hover:bg-green-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}

          </div>
          <div className="text-center mt-16 sm:mt-10">
            <Link
              to="/internships"
              className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-800 hover:to-green-900 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
            >
              Explore All Internships
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-gray-50 via-white to-green-50 overflow-hidden relative">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-green-100/40 to-green-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-emerald-100/40 to-emerald-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-full text-green-700 text-sm font-medium mb-6 shadow-lg backdrop-blur-sm">
              <Star className="w-4 h-4 mr-9 text-green-600 fill-green-600" />
              Trusted by 15,000+ Students Across India
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-gray-900 via-green-900 to-gray-900 bg-clip-text text-transparent">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover how students from across India transformed their careers with InternX
            </p>
          </div>

          <div className="relative">
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-14 h-14 bg-white/90 backdrop-blur-sm hover:bg-white border border-green-200/50 rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 group hover:scale-110"
              aria-label="Previous testimonials"
            >
              <ChevronLeft className="w-6 h-6 text-green-600 group-hover:text-green-700 transition-colors" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-14 h-14 bg-white/90 backdrop-blur-sm hover:bg-white border border-green-200/50 rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 group hover:scale-110"
              aria-label="Next testimonials"
            >
              <ChevronRight className="w-6 h-6 text-green-600 group-hover:text-green-700 transition-colors" />
            </button>

            <div className="overflow-hidden px-8">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                  <div key={slideIndex} className="min-w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {getCurrentSlideTestimonials().map((testimonial, index) => (
                        <div
                          key={`${slideIndex}-${index}`}
                          className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-green-100/50 hover:border-green-200/50 transform hover:-translate-y-2 hover:scale-[1.02]"
                        >
                          <div className="absolute -top-0 -left-4 w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Quote className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex mb-6 justify-center">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-5 h-5 text-amber-400 fill-amber-400 mr-1 group-hover:scale-110 transition-transform"
                                style={{ transitionDelay: `${i * 50}ms` }}
                              />
                            ))}
                          </div>
                          <blockquote className="text-gray-700 leading-relaxed mb-6 text-center italic font-medium">
                            "{testimonial.quote}"
                          </blockquote>
                          <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                              <span className="text-2xl font-bold text-green-700">
                                {testimonial.name.charAt(0)}
                              </span>
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 mb-1">
                              {testimonial.name}
                            </h4>
                            <p className="text-sm text-green-600 font-medium">
                              {testimonial.location}
                            </p>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center mt-12 space-x-3">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentSlide(index);
                    setIsAutoSliding(false);
                    setTimeout(() => setIsAutoSliding(true), 10000);
                  }}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                    ? 'bg-gradient-to-r from-green-500 to-green-600 scale-125 shadow-lg'
                    : 'bg-green-200 hover:bg-green-300 hover:scale-110'
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

         
        </div>

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-green-400 rounded-full animate-pulse opacity-60"></div>
          <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-emerald-400 rounded-full animate-pulse opacity-40" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-3/4 w-1 h-1 bg-green-500 rounded-full animate-pulse opacity-80" style={{ animationDelay: '2s' }}></div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Your Journey Starts Here</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to kickstart your internship adventure
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center group">
              <div className="bg-gradient-to-r from-green-600 to-green-800 text-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Build Profile</h3>
              <p className="text-gray-600 text-sm">Create a standout profile showcasing your skills and experience</p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-r from-green-600 to-green-800 text-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Discover Internships</h3>
              <p className="text-gray-600 text-sm">Explore tailored internship opportunities that match your goals</p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-r from-green-600 to-green-800 text-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Get Started</h3>
              <p className="text-gray-600 text-sm">Apply effortlessly and connect with top employers</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-600 to-green-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to Shape Your Future?</h2>
          <p className="text-lg sm:text-xl text-white/90 mb-8">Join thousands of students who have launched their careers with us</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">

            <Link
              to="/internships"
              className="border-2 border-white text-white hover:bg-white hover:text-green-700 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
            >
              Browse Opportunities
            </Link>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-950 text-white py-8 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#15803D]/20 to-transparent opacity-50"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex flex-col items-center sm:items-start">
              <img
                src="/internx-logo-white.png"
                alt="InternX Logo"
                className="h-24 w-24 sm:h-32 sm:w-32 lg:h-40 lg:w-40 object-contain mb-4"
              />
              <p className="text-gray-200 text-sm leading-relaxed max-w-xs text-center sm:text-left">
                Empowering career growth through global internship opportunities at InternX, a WiZdomEd initiative based in Mangalore, Karnataka.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white text-center sm:text-left">Quick Links</h3>
            <ul className="space-y-2 text-center sm:text-left">
              <li><Link to="/about" className="text-gray-200 hover:text-[#15803D] transition-all duration-300 ease-in-out hover:translate-x-1 block">About InternX</Link></li>
              <li><Link to="https://www.wizx.org/" className="text-gray-200 hover:text-[#15803D] transition-all duration-300 ease-in-out hover:translate-x-1 block">About WiZdomEd</Link></li>
              <li><Link to="/internships" className="text-gray-200 hover:text-[#15803D] transition-all duration-300 ease-in-out hover:translate-x-1 block">InternX Opportunities</Link></li>
              <li><Link to="/login" className="text-gray-200 hover:text-[#15803D] transition-all duration-300 ease-in-out hover:translate-x-1 block">Sign In to InternX</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white text-center sm:text-left">Contact</h3>
            <div className="text-center sm:text-left">
              <p className="text-gray-200 text-sm mb-2">Email: <a href="mailto:hello@internx.in" className="hover:text-[#15803D] transition-colors">hello@internx.in</a></p>
              <p className="text-gray-200 text-sm mb-2">Phone: <a href="tel:+91918431220992" className="hover:text-[#15803D] transition-colors">+91 918431220992</a></p>
              <p className="text-gray-200 text-sm">Inland Ornate Building, Navabharath Cir, Kodailbail, Mangaluru, Karnataka 575003</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white text-center sm:text-left">Follow WiZdomEd</h3>
            <div className="flex space-x-4 justify-center sm:justify-start">
              <a href="https://www.facebook.com/Wizdom.ed" target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-[#15803D] transition-all duration-300 transform hover:scale-110">
                <Facebook className="w-6 h-6" aria-label="Facebook" />
              </a>
              <a href="https://youtube.com/@wizdominstitutionsnetwork?si=IkoTqfjzqQXQWqB6" target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-[#15803D] transition-all duration-300 transform hover:scale-110">
                <Youtube className="w-6 h-6" aria-label="Youtube" />
              </a>
              <a href="https://www.linkedin.com/company/65612472/" target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-[#15803D] transition-all duration-300 transform hover:scale-110">
                <Linkedin className="w-6 h-6" aria-label="LinkedIn" />
              </a>
              <a href="https://www.instagram.com/wizdom.ed/" target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-[#15803D] transition-all duration-300 transform hover:scale-110">
                <Instagram className="w-6 h-6" aria-label="Instagram" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800 text-center text-gray-200 relative z-10">
          <p className="text-sm">© {new Date().getFullYear()} WiZdomEd's InternX. All rights reserved.</p>
        </div>

        <div className="absolute inset-0 pointer-events-none">
          <div className="w-2 h-2 bg-[#15803D] rounded-full absolute top-10 left-20 animate-[float_4s_ease-in-out_infinite]"></div>
          <div className="w-3 h-3 bg-[#15803D]/50 rounded-full absolute bottom-20 right-10 animate-[float_4s_ease-in-out_infinite_1s]"></div>
          <div className="w-1 h-1 bg-[#15803D]/70 rounded-full absolute top-1/2 left-1/3 animate-[float_4s_ease-in-out_infinite_0.5s]"></div>
        </div>
      </footer>


    </div>
  );
};

export default Home;



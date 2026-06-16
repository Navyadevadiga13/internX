// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// import {
//   User,
//   Mail,
//   Phone,
//   Lock,
//   Eye,
//   EyeOff,
//   MapPin,
//   Target,
//   GraduationCap,
//   Upload,
//   X,
//   Check,
//   Briefcase,
//   Globe,
//   Search
// } from 'lucide-react';
// import toast from 'react-hot-toast';

// // Determine API base URL based on environment
// const getApiBaseUrl = (): string => {
//   if (typeof window !== 'undefined') {
//     const hostname = window.location.hostname;

//     // Production URLs
//     if (hostname === 'internx.io' || hostname === 'www.internx.io') {
//       return 'https://api.internx.io/api';
//     }

//     // Vercel/Netlify deployments
//     if (hostname.includes('vercel.app') || hostname.includes('netlify.app')) {
//       return 'https://api.internx.io/api';
//     }

//     // Local development
//     return 'http://localhost:5000/api';
//   }

//   return 'http://localhost:5000/api';
// };

// const API_BASE_URL: string = getApiBaseUrl();

// // Predefined skills (200 items)
// const predefinedSkills: string[] = [
//   'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'TypeScript',
//   'HTML', 'CSS', 'React', 'Angular', 'Vue.js', 'Node.js', 'Django', 'Flask', 'Spring Boot', 'ASP.NET',
//   'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'SQLite', 'Firebase', 'DynamoDB', 'Cassandra',
//   'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'Ansible', 'Git', 'GitHub',
//   'GitLab', 'Bitbucket', 'CI/CD', 'DevOps', 'Agile', 'Scrum', 'Kanban', 'TDD', 'BDD', 'REST API',
//   'GraphQL', 'WebSockets', 'Microservices', 'Serverless', 'Linux', 'Windows Server', 'Bash', 'PowerShell', 'Apache', 'Nginx',
//   'Machine Learning', 'Deep Learning', 'AI', 'NLP', 'Computer Vision', 'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Pandas',
//   'NumPy', 'Matplotlib', 'Seaborn', 'Tableau', 'Power BI', 'Data Analysis', 'Data Visualization', 'Big Data', 'Hadoop', 'Spark',
//   'UI/UX Design', 'Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'InDesign', 'Wireframing', 'Prototyping', 'User Research',
//   'Cybersecurity', 'Ethical Hacking', 'Penetration Testing', 'Network Security', 'Cryptography', 'OWASP', 'SIEM', 'Firewall', 'VPN', 'IDS/IPS',
//   'Blockchain', 'Smart Contracts', 'Ethereum', 'Solidity', 'Web3', 'DApps', 'Cryptocurrency', 'NFT', 'DeFi', 'Metaverse',
//   'Mobile Development', 'Android', 'iOS', 'React Native', 'Flutter', 'Xamarin', 'Ionic', 'SwiftUI', 'Jetpack Compose', 'Kotlin Multiplatform',
//   'Game Development', 'Unity', 'Unreal Engine', 'Godot', 'Cocos2d', '3D Modeling', 'Blender', 'Maya', 'ZBrush', 'Game Design',
//   'Cloud Computing', 'SaaS', 'PaaS', 'IaaS', 'Virtualization', 'VMware', 'Hyper-V', 'OpenStack', 'CloudFormation', 'Server Management',
//   'SEO', 'Digital Marketing', 'Content Marketing', 'Social Media Marketing', 'Google Analytics', 'SEM', 'PPC', 'Email Marketing', 'Copywriting', 'Branding',
//   'Project Management', 'PMP', 'Agile Project Management', 'JIRA', 'Trello', 'Asana', 'Monday.com', 'Risk Management', 'Stakeholder Management', 'Scrum Master',
//   'Database Administration', 'ETL', 'Data Warehousing', 'Snowflake', 'Redshift', 'BigQuery', 'Data Modeling', 'ERD', 'Normalization', 'Indexing',
//   'AR/VR', 'Augmented Reality', 'Virtual Reality', 'Mixed Reality', 'Oculus', 'Hololens', 'Unity AR', 'ARKit', 'ARCore', 'VR Development',
//   'IoT', 'Embedded Systems', 'Raspberry Pi', 'Arduino', 'MQTT', 'Zigbee', 'BLE', 'Firmware Development', 'Sensor Integration', 'Edge Computing',
//   'Frontend Development', 'Backend Development', 'Full Stack Development', 'Web Development', 'App Development', 'API Development', 'Database Design', 'System Architecture', 'Scalability', 'Performance Optimization',
//   'Statistician', 'Data Analyst', 'Data Engineer', 'Machine Learning Engineer', 'AI Researcher', 'Cloud Architect', 'DevOps Engineer', 'Cybersecurity Analyst', 'Blockchain Developer', 'Mobile Developer',
//   'Game Developer', 'UI/UX Designer', 'Product Manager', 'Project Manager', 'Scrum Master', 'Business Analyst', 'Quality Assurance Engineer', 'Software Architect', 'Technical Writer', 'Content Creator',
//   'Digital Marketer', 'SEO Specialist', 'Network Administrator', 'System Administrator', 'Database Administrator', 'Web Designer', 'Graphic Designer', '3D Artist', 'Animation Specialist', 'AR/VR Developer','Project Management','Business Management','Human Resource Management','Sales',
//   'IoT Engineer', 'Embedded Systems Engineer'
// ];

// // Predefined keywords (200 items)
// const predefinedKeywords: string[] = [
//   'Web Development', 'Mobile Development', 'Software Engineering', 'Data Science', 'Machine Learning', 'Artificial Intelligence', 'Cloud Computing', 'DevOps', 'Cybersecurity', 'Blockchain',
//   'Frontend', 'Backend', 'Full Stack', 'UI/UX', 'Game Development', 'AR/VR', 'IoT', 'Big Data', 'Data Analysis', 'Business Intelligence',
//   'JavaScript Frameworks', 'Python Development', 'Java Enterprise', 'C++ Programming', 'C# Development', 'Ruby on Rails', 'PHP Development', 'Swift Programming', 'Kotlin Development', 'TypeScript Development',
//   'HTML5', 'CSS3', 'React Ecosystem', 'Angular Framework', 'Vue.js Development', 'Node.js Backend', 'Django Framework', 'Flask Applications', 'Spring Framework', 'ASP.NET Core',
//   'Database Management', 'SQL Queries', 'NoSQL Databases', 'MySQL Administration', 'PostgreSQL Development', 'MongoDB Architecture', 'Redis Caching', 'Oracle Database', 'SQLite Integration', 'Firebase Services',
//   'AWS Cloud', 'Azure Services', 'Google Cloud Platform', 'Docker Containers', 'Kubernetes Orchestration', 'Jenkins Automation', 'Terraform Infrastructure', 'Ansible Configuration', 'Git Versioning', 'CI/CD Pipelines',
//   'Agile Methodology', 'Scrum Framework', 'Kanban Workflow', 'Test-Driven Development', 'Behavior-Driven Development', 'RESTful APIs', 'GraphQL Queries', 'WebSocket Communication', 'Microservices Architecture', 'Serverless Computing',
//   'Linux Administration', 'Windows Server Management', 'Bash Scripting', 'PowerShell Automation', 'Apache Configuration', 'Nginx Optimization', 'Machine Learning Models', 'Deep Learning Networks', 'NLP Applications', 'Computer Vision Systems',
//   'TensorFlow Framework', 'PyTorch Models', 'Keras API', 'Scikit-learn Pipelines', 'Pandas Analysis', 'NumPy Computations', 'Matplotlib Visualizations', 'Seaborn Plots', 'Tableau Dashboards', 'Power BI Reports',
//   'UI Design', 'UX Research', 'Figma Prototyping', 'Sketch Design', 'Adobe XD Wireframes', 'Photoshop Editing', 'Project Management','Business Management','Human Resource Management','Sales'
// ];

// interface FormData {
//   name: string;
//   email: string;
//   password: string;
//   confirmPassword: string;
//   phone: string;
//   otp: string;
//   currentCity: string;
//   pinCode:string;
//   futureGoals: string;
//   studyPreference: string;
//   section: string;
//   higherEducation: string;
//   twelfthPU: {
//     institution: string;
//     passedYear: string;
//     percentage: string;
//   };
//   ugDegree: {
//     institution: string;
//     course: string;
//     year: string;
//     percentage: string;
//   };
//   pgMasters: {
//     institution: string;
//     course: string;
//     year: string;
//     percentage: string;
//   };
//   currentAcademicStatus: string;
//   skills: string[];
//   keywords: string[];
//   resume: File | null;
//   profilePicture: File | null;
// }

// const Register: React.FC = () => {
//   const { register, sendOTP } = useAuth();
//   const navigate = useNavigate();
//   const [currentStep, setCurrentStep] = useState<number>(1);
//   const [otpSent, setOtpSent] = useState<boolean>(false);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [showPassword, setShowPassword] = useState<boolean>(false);
//   const [skillSuggestions] = useState<string[]>(predefinedSkills);
//   const [showSkillSuggestions, setShowSkillSuggestions] = useState<boolean>(false);
//   const [filteredSkillSuggestions, setFilteredSkillSuggestions] = useState<string[]>([]);
//   const [keywordSuggestions] = useState<string[]>(predefinedKeywords);
//   const [showKeywordSuggestions, setShowKeywordSuggestions] = useState<boolean>(false);
//   const [filteredKeywordSuggestions, setFilteredKeywordSuggestions] = useState<string[]>([]);
//   const [termsAccepted, setTermsAccepted] = useState(false);
//   const [marketingConsent, setMarketingConsent] = useState(false);
//   const [formData, setFormData] = useState<FormData>({
//     name: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     phone: '',
//     otp: '',
//     currentCity: '',
//      pinCode:'',
//     futureGoals: '',
//     studyPreference: 'Abroad',
//     section: '',
//     higherEducation: '',
//     twelfthPU: {
//       institution: '',
//       passedYear: '',
//       percentage: ''
//     },
//     ugDegree: {
//       institution: '',
//       course: '',
//       year: '',
//       percentage: ''
//     },
//     pgMasters: {
//       institution: '',
//       course: '',
//       year: '',
//       percentage: ''
//     },
//       currentAcademicStatus: 'First Year',
//     skills: [],
//     keywords: [],
//     resume: null,
//     profilePicture: null
//   });

//   const [skillInput, setSkillInput] = useState<string>('');
//   const [keywordInput, setKeywordInput] = useState<string>('');

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;

//     if (name.includes('.')) {
//       const [parent, child] = name.split('.');
//       setFormData(prev => ({
//         ...prev,
//         [parent]: {
//           ...prev[parent as keyof FormData],
//           [child]: value
//         }
//       }));
//     } else {
//       setFormData(prev => ({
//         ...prev,
//         [name]: value
//       }));
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'profilePicture') => {
//     const file = e.target.files?.[0];
//     if (file) {
//       if (type === 'resume' && file.type !== 'application/pdf') {
//         toast.error('Please select a PDF file for resume');
//         return;
//       }
//       if (type === 'profilePicture' && !file.type.startsWith('image/')) {
//         toast.error('Please select an image file for profile picture');
//         return;
//       }

//       setFormData(prev => ({
//         ...prev,
//         [type]: file
//       }));
//     }
//   };

//   const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setSkillInput(value);

//     if (value.length > 0) {
//       const filtered = skillSuggestions
//         .filter(skill =>
//           skill.toLowerCase().includes(value.toLowerCase()) &&
//           !formData.skills.includes(skill)
//         )
//         .slice(0, 10);
//       setFilteredSkillSuggestions(filtered);
//       setShowSkillSuggestions(true);
//     } else {
//       setShowSkillSuggestions(false);
//     }
//   };

//   const handleKeywordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setKeywordInput(value);

//     if (value.length > 0) {
//       const filtered = keywordSuggestions
//         .filter(keyword =>
//           keyword.toLowerCase().includes(value.toLowerCase()) &&
//           !formData.keywords.includes(keyword)
//         )
//         .slice(0, 10);
//       setFilteredKeywordSuggestions(filtered);
//       setShowKeywordSuggestions(true);
//     } else {
//       setShowKeywordSuggestions(false);
//     }
//   };

//   const addSkillFromSuggestion = (skill: string) => {
//     if (!formData.skills.includes(skill)) {
//       setFormData(prev => ({
//         ...prev,
//         skills: [...prev.skills, skill]
//       }));
//     }
//     setSkillInput('');
//     setShowSkillSuggestions(false);
//   };

//   const addSkill = () => {
//     if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
//       setFormData(prev => ({
//         ...prev,
//         skills: [...prev.skills, skillInput.trim()]
//       }));
//       setSkillInput('');
//       setShowSkillSuggestions(false);
//     }
//   };

//   const removeSkill = (skill: string) => {
//     setFormData(prev => ({
//       ...prev,
//       skills: prev.skills.filter(s => s !== skill)
//     }));
//   };

//   const addKeywordFromSuggestion = (keyword: string) => {
//     if (!formData.keywords.includes(keyword)) {
//       setFormData(prev => ({
//         ...prev,
//         keywords: [...prev.keywords, keyword]
//       }));
//     }
//     setKeywordInput('');
//     setShowKeywordSuggestions(false);
//   };

//   const addKeyword = () => {
//     if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
//       setFormData(prev => ({
//         ...prev,
//         keywords: [...prev.keywords, keywordInput.trim()]
//       }));
//       setKeywordInput('');
//       setShowKeywordSuggestions(false);
//     }
//   };

//   const removeKeyword = (keyword: string) => {
//     setFormData(prev => ({
//       ...prev,
//       keywords: prev.keywords.filter(k => k !== keyword)
//     }));
//   };

//   const handleSendOTP = async () => {
//     if (!formData.email) {
//       toast.error('Please enter your email address');
//       return;
//     }

//     setLoading(true);
//     try {
//       await sendOTP(formData.email);
//       setOtpSent(true);
//       toast.success('OTP sent to your email!');
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || 'Failed to send OTP');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const validateStep = (step: number): boolean => {
//     switch (step) {
//       case 1:
//         if (!formData.name || !formData.email || !formData.password || !formData.phone) {
//           toast.error('Please fill in all required fields');
//           return false;
//         }
//         if (formData.password !== formData.confirmPassword) {
//           toast.error('Passwords do not match');
//           return false;
//         }
//         if (!otpSent) {
//           toast.error('Please send and verify OTP first');
//           return false;
//         }
//         if (!formData.otp) {
//           toast.error('Please enter the OTP');
//           return false;
//         }
//         return true;
//       case 2:
//         if (!formData.currentCity || formData.currentCity.trim() === '') {
//           toast.error('Please enter your current city');
//           return false;
//         }

//         if (!formData.pinCode || formData.pinCode.trim() === '') {
//           toast.error('Please enter your area pincode');
//           return false;
//         }
//         return true;

//  case 3:
//   if (
//     !formData.twelfthPU.institution || formData.twelfthPU.institution.trim() === '' ||
//     !formData.ugDegree.institution || formData.ugDegree.institution.trim() === ''
//   ) {
//     toast.error('Please enter institution for all education details');
//     return false;
//   }
//   if (!formData.currentAcademicStatus || formData.currentAcademicStatus.trim() === '') {
//     toast.error('Please select your current academic status');
//     return false;
//   }
//   return true; // other fields optional


//       case 4:
//         if (formData.skills.length === 0) {
//           toast.error('Please add at least one skill');
//           return false;
//         }
//         if (formData.keywords.length === 0) {
//           toast.error('Please add at least one keyword');
//           return false;
//         }
//         return true;
//       default:
//         return true;
//     }
//   };

//   const nextStep = () => {
//     if (validateStep(currentStep)) {
//       setCurrentStep(prev => Math.min(prev + 1, 4));
//     }
//   };

//   const prevStep = () => {
//     setCurrentStep(prev => Math.max(prev - 1, 1));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!validateStep(4)) return;

//     setLoading(true);
//     try {
//       await register(formData);
//       toast.success('Registration successful!');
//       navigate('/dashboard');
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || 'Registration failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderStep = () => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <div className="space-y-6">
//             <h3 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h3>

//             {/* Name */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
//               <div className="relative">
//                 <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleInputChange}
//                   required
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                   placeholder="Enter your full name"
//                 />
//               </div>
//             </div>

//             {/* Email */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
//               <div className="flex space-x-2">
//                 <div className="relative flex-1">
//                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                   <input
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleInputChange}
//                     required
//                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                     placeholder="Enter your email"
//                   />
//                 </div>
//                 <button
//                   type="button"
//                   onClick={handleSendOTP}
//                   disabled={loading || !formData.email}
//                   className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
//                 >
//                   {loading ? 'Sending...' : 'Send OTP'}
//                 </button>
//               </div>
//             </div>

//             {/* OTP */}
//             {otpSent && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP *</label>
//                 <input
//                   type="text"
//                   name="otp"
//                   value={formData.otp}
//                   onChange={handleInputChange}
//                   required
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                   placeholder="Enter 6-digit OTP"
//                 />
//               </div>
//             )}

//             {/* Phone */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
//               <div className="relative">
//                 <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <input
//                   type="tel"
//                   name="phone"
//                   value={formData.phone}
//                   onChange={handleInputChange}
//                   required
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                   placeholder="Enter your phone number"
//                 />
//               </div>
//             </div>

//             {/* Password */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   name="password"
//                   value={formData.password}
//                   onChange={handleInputChange}
//                   required
//                   className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                   placeholder="Create a password"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2"
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-5 w-5 text-gray-400" />
//                   ) : (
//                     <Eye className="h-5 w-5 text-gray-400" />
//                   )}
//                 </button>
//               </div>
//             </div>

//             {/* Confirm Password */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <input
//                   type="password"
//                   name="confirmPassword"
//                   value={formData.confirmPassword}
//                   onChange={handleInputChange}
//                   required
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                   placeholder="Confirm your password"
//                 />
//               </div>
//             </div>
//           </div>
//         );

//       case 2:
//         return (
//           <div className="space-y-6">
//             <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h3>

//             {/* Current City */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Current City *</label>
//               <div className="relative">
//                 <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <input
//                   type="text"
//                   name="currentCity"
//                   value={formData.currentCity}
//                   onChange={handleInputChange}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                   placeholder="Enter your current city"
//                 />
//               </div>
//             </div>

//             {/*pincode*/}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Pin Code*</label>
//               <div className="relative">
//                 <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <input
//                   type="text"
//                   name="pinCode"
//                   value={formData.pinCode}
//                   onChange={handleInputChange}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                   placeholder="Enter Your Area Pin Code (Eg:575004)"
//                 />
//               </div>
//             </div>

//             {/* Study Preference */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Future Study Preference</label>
//               <div className="relative">
//                 <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <select
//                   name="studyPreference"
//                   value={formData.studyPreference}
//                   onChange={handleInputChange}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                 >
//                   <option value="Abroad">Study Abroad</option>
//                   <option value="India">Study in India</option>
//                   <option value="Both">Open to Both</option>
//                 </select>
//               </div>
//             </div>

//             {/* Future Goals */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Future Goals (optional)</label>
//               <div className="relative">
//                 <Target className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//                 <textarea
//                   name="futureGoals"
//                   value={formData.futureGoals}
//                   onChange={handleInputChange}
//                   rows={4}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                   placeholder="Describe your career goals and aspirations"
//                 />
//               </div>
//             </div>

//             {/* Section */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Section/Stream (optional)</label>
//               <input
//                 type="text"
//                 name="section"
//                 value={formData.section}
//                 onChange={handleInputChange}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                 placeholder="e.g., Science, Commerce, Arts"
//               />
//             </div>

//             {/* Higher Education */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Higher Education Plans (optional)</label>
//               <textarea
//                 name="higherEducation"
//                 value={formData.higherEducation}
//                 onChange={handleInputChange}
//                 rows={3}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                 placeholder="Describe your higher education plans"
//               />
//             </div>
//           </div>
//         );
//       case 3:
//         return (
//           <div className="space-y-6">
//             <h3 className="text-xl font-semibold text-gray-900 mb-4">Educational Background</h3>

//             {/* 12th/PU */}
//             <div className="bg-gray-50 p-4 rounded-xl">
//               <h4 className="font-medium text-gray-900 mb-3 flex items-center">
//                 <GraduationCap className="h-5 w-5 mr-2" />
//                 12th/PU Details
//               </h4>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Institution *</label>
//                   <input
//                     type="text"
//                     name="twelfthPU.institution"
//                     value={formData.twelfthPU.institution}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                     placeholder="School/College name"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Passed Year (optional)</label>
//                   <input
//                     type="text"
//                     name="twelfthPU.passedYear"
//                     value={formData.twelfthPU.passedYear}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                     placeholder="2023"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Percentage (optional)</label>
//                   <input
//                     type="text"
//                     name="twelfthPU.percentage"
//                     value={formData.twelfthPU.percentage}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                     placeholder="85%"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* UG Degree */}
//             <div className="bg-gray-50 p-4 rounded-xl">
//               <h4 className="font-medium text-gray-900 mb-3 flex items-center">
//                 <GraduationCap className="h-5 w-5 mr-2" />
//                 UG Degree Details
//               </h4>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Institution *</label>
//                   <input
//                     type="text"
//                     name="ugDegree.institution"
//                     value={formData.ugDegree.institution}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                     placeholder="University/College name"
//                   />
//                 </div>
//                 <div>

//                   <label className="block text-sm font-medium text-gray-700 mb-1">Course (optional)</label>
//                   <input
//                     type="text"
//                     name="ugDegree.course"
//                     value={formData.ugDegree.course}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                     placeholder="B.Tech, B.Com, etc."
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Year (optional)</label>
//                   <input
//                     type="text"
//                     name="ugDegree.year"
//                     value={formData.ugDegree.year}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                     placeholder="2024"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Percentage/CGPA (optional)</label>
//                   <input
//                     type="text"
//                     name="ugDegree.percentage"
//                     value={formData.ugDegree.percentage}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                     placeholder="8.5 CGPA or 85%"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* PG/Masters */}
//             <div className="bg-gray-50 p-4 rounded-xl">
//               <h4 className="font-medium text-gray-900 mb-3 flex items-center">
//                 <GraduationCap className="h-5 w-5 mr-2" />
//                 PG/Masters Details (if applicable)
//               </h4>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Institution </label>
//                   <input
//                     type="text"
//                     name="pgMasters.institution"
//                     value={formData.pgMasters.institution}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                     placeholder="University/College name"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Course </label>
//                   <input
//                     type="text"
//                     name="pgMasters.course"
//                     value={formData.pgMasters.course}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                     placeholder="M.Tech, MBA, etc."
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
//                   <input
//                     type="text"
//                     name="pgMasters.year"
//                     value={formData.pgMasters.year}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                     placeholder="2026"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Percentage/CGPA</label>
//                   <input
//                     type="text"
//                     name="pgMasters.percentage"
//                     value={formData.pgMasters.percentage}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                     placeholder="8.5 CGPA or 85%"
//                   />
//                 </div>
//                 {/* Current Academic Status */}
// <div>
//   <label className="block text-sm font-medium text-gray-700 mb-2">
//     Current Academic Status *
//   </label>
//   <div className="flex flex-wrap gap-4">
//     {["First Year", "Second Year", "Third Year", "Fourth Year", "Graduated"].map((status) => (
//       <label key={status} className="flex items-center space-x-2">
//         <input
//           type="radio"
//           name="currentAcademicStatus"
//           value={status}
//           checked={formData.currentAcademicStatus === status}
//           onChange={handleInputChange}
//           required
//           className="form-radio text-green-600"
//         />
//         <span className="text-gray-700">{status}</span>
//       </label>
//     ))}
//   </div>
// </div>

//               </div>
//             </div>
//           </div>
//         );
//       case 4:
//         return (
//           <div className="space-y-6">
//             <h3 className="text-xl font-semibold text-gray-900 mb-4">Skills & Documents</h3>

//             {/* Skills with Suggestions */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Skills *</label>
//               <div className="relative">
//                 <div className="flex space-x-2 mb-3">
//                   <div className="relative flex-1">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                     <input
//                       type="text"
//                       value={skillInput}
//                       onChange={handleSkillInputChange}
//                       onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
//                       className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                       placeholder="Type to search skills (e.g., JavaScript, Python)"
//                     />

//                     {/* Skill Suggestions Dropdown */}
//                     {showSkillSuggestions && filteredSkillSuggestions.length > 0 && (
//                       <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
//                         {filteredSkillSuggestions.map((skill, index) => (
//                           <button
//                             key={index}
//                             type="button"
//                             onClick={() => addSkillFromSuggestion(skill)}
//                             className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
//                           >
//                             {skill}
//                           </button>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                   <button
//                     type="button"
//                     onClick={addSkill}
//                     className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
//                   >
//                     Add
//                   </button>
//                 </div>

//                 <div className="flex flex-wrap gap-2">
//                   {formData.skills.map((skill, index) => (
//                     <span
//                       key={index}
//                       className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center"
//                     >
//                       {skill}
//                       <button
//                         type="button"
//                         onClick={() => removeSkill(skill)}
//                         className="ml-2 text-green-600 hover:text-green-800"
//                       >
//                         <X className="h-3 w-3" />
//                       </button>
//                     </span>
//                   ))}
//                 </div>

//                 <p className="text-xs text-gray-500 mt-2">
//                   Add at least one skill. We recommend up to 200 skills for better job matching.
//                   ({formData.skills.length}/200)
//                 </p>
//               </div>
//             </div>

//             {/* Keywords */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Keywords/Interests *</label>
//               <div className="relative">
//                 <div className="flex space-x-2 mb-3">
//                   <div className="relative flex-1">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                     <input
//                       type="text"
//                       value={keywordInput}
//                       onChange={handleKeywordInputChange}
//                       onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
//                       className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                       placeholder="Type to search keywords (e.g., Web Development, AI)"
//                     />

//                     {/* Keyword Suggestions Dropdown */}
//                     {showKeywordSuggestions && filteredKeywordSuggestions.length > 0 && (
//                       <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
//                         {filteredKeywordSuggestions.map((keyword, index) => (
//                           <button
//                             key={index}
//                             type="button"
//                             onClick={() => addKeywordFromSuggestion(keyword)}
//                             className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
//                           >
//                             {keyword}
//                           </button>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                   <button
//                     type="button"
//                     onClick={addKeyword}
//                     className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
//                   >
//                     Add
//                   </button>
//                 </div>
//                 <div className="flex flex-wrap gap-2">
//                   {formData.keywords.map((keyword, index) => (
//                     <span
//                       key={index}
//                       className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
//                     >
//                       {keyword}
//                       <button
//                         type="button"
//                         onClick={() => removeKeyword(keyword)}
//                         className="ml-2 text-blue-600 hover:text-blue-800"
//                       >
//                         <X className="h-3 w-3" />
//                       </button>
//                     </span>
//                   ))}
//                 </div>

//                 <p className="text-xs text-gray-500 mt-2">
//                   Add at least one keyword. We recommend up to 200 keywords for better matching.
//                   ({formData.keywords.length}/200)
//                 </p>
//               </div>
//             </div>

//             {/* Resume Upload */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Resume (optional)</label>
//               <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
//                 <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
//                 <input
//                   type="file"
//                   accept=".pdf"
//                   onChange={(e) => handleFileChange(e, 'resume')}
//                   className="hidden"
//                   id="resume-upload"
//                 />
//                 <label
//                   htmlFor="resume-upload"
//                   className="cursor-pointer text-green-600 hover:text-green-700 font-medium"
//                 >
//                   Click to upload resume
//                 </label>
//                 <p className="text-sm text-gray-500 mt-1">PDF files only, max 10MB</p>
//                 {formData.resume && (
//                   <p className="text-sm text-green-600 mt-2 flex items-center justify-center">
//                     <Check className="h-4 w-4 mr-1" />
//                     {formData.resume.name}
//                   </p>
//                 )}
//               </div>
//             </div>

//             {/* Profile Picture Upload */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture (optional)</label>
//               <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
//                 <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={(e) => handleFileChange(e, 'profilePicture')}
//                   className="hidden"
//                   id="profile-upload"
//                 />
//                 <label
//                   htmlFor="profile-upload"
//                   className="cursor-pointer text-green-600 hover:text-green-700 font-medium"
//                 >
//                   Click to upload profile picture
//                 </label>
//                 <p className="text-sm text-gray-500 mt-1">JPG, PNG files only, max 5MB</p>
//                 {formData.profilePicture && (
//                   <p className="text-sm text-green-600 mt-2 flex items-center justify-center">
//                     <Check className="h-4 w-4 mr-1" />
//                     {formData.profilePicture.name}
//                   </p>
//                 )}
//               </div>
//             </div>

//             {/* Privacy Policy and Terms */}
//             {/* Both checkboxes with consistent spacing */}
//             <div className="space-y-4 pt-4 border-t border-gray-200">
//               <div className="flex items-start gap-3">
//                 <input
//                   type="checkbox"
//                   id="termsAccepted"
//                   checked={termsAccepted}
//                   onChange={(e) => setTermsAccepted(e.target.checked)}
//                   className="flex-shrink-0 mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
//                 />
//                 <label htmlFor="termsAccepted" className="text-sm text-gray-700">
//                   I accept the{' '}
//                   <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 underline font-medium">
//                     Terms and Conditions
//                   </a>
//                   {' '}and{' '}
//                   <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 underline font-medium">
//                     Privacy Policy
//                   </a>
//                   <span className="text-red-500 ml-1">*</span>
//                 </label>
//               </div>

//               <div className="flex items-start gap-3">
//                 <input
//                   type="checkbox"
//                   id="marketingConsent"
//                   checked={marketingConsent}
//                   onChange={(e) => setMarketingConsent(e.target.checked)}
//                   className="flex-shrink-0 mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
//                 />
//                 <label htmlFor="marketingConsent" className="text-sm text-gray-700">
//                   I consent to receive updates, newsletters, and promotional offers from InternX and WiZdom.ed via email and other communication channels
//                 </label>
//               </div>
//             </div>

//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-2xl mx-auto">

//         {/* Header */}
//         <div className="text-center mb-8">
//           <div className="flex justify-center">
//             <div className="bg-green-600 p-3 rounded-2xl">
//               <Briefcase className="h-8 w-8 text-white" />
//             </div>
//           </div>
//           <h2 className="mt-6 text-3xl font-bold text-gray-900">Join InternX</h2>
//           <p className="mt-2 text-sm text-gray-600">
//             Create your account and start your internship journey
//           </p>
//         </div>

//         {/* Progress Bar */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between mb-2">
//             {[1, 2, 3, 4].map((step) => (
//               <div
//                 key={step}
//                 className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${step <= currentStep
//                   ? 'bg-green-600 text-white'
//                   : 'bg-gray-200 text-gray-600'
//                   }`}
//               >
//                 {step < currentStep ? <Check className="h-4 w-4" /> : step}
//               </div>
//             ))}
//           </div>
//           <div className="w-full bg-gray-200 rounded-full h-2">
//             <div
//               className="bg-green-600 h-2 rounded-full transition-all duration-300"
//               style={{ width: `${(currentStep / 4) * 100}%` }}
//             ></div>
//           </div>
//           <div className="flex justify-between text-xs text-gray-500 mt-1">
//             <span>Basic Info</span>
//             <span>Personal</span>
//             <span>Education</span>
//             <span>Skills</span>
//           </div>
//         </div>

//         {/* Form */}
//         <div className="bg-white rounded-2xl shadow-xl p-8">
//           <form onSubmit={handleSubmit}>
//             {renderStep()}

//             {/* Navigation Buttons */}
//             <div className="flex justify-between mt-8">
//               <button
//                 type="button"
//                 onClick={prevStep}
//                 disabled={currentStep === 1}
//                 className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 Previous
//               </button>

//               {currentStep < 4 ? (
//                 <button
//                   type="button"
//                   onClick={nextStep}
//                   className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
//                 >
//                   Next
//                 </button>
//               ) : (
//    <button
//   type="submit"
//   disabled={!(termsAccepted && marketingConsent)}
//   className={`mt-4 px-4 py-2 rounded text-white ${
//     termsAccepted && marketingConsent
//       ? 'bg-green-600 hover:bg-green-700'
//       : 'bg-gray-400 cursor-not-allowed'
//   }`}
// >
//   Create Account
// </button>

//               )}
//             </div>
//           </form>

//           {/* Login Link */}
//           <div className="mt-6 text-center">
//             <p className="text-sm text-gray-600">
//               Already have an account?{' '}
//               <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
//                 Sign in here
//               </Link>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Register;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  otp: string;
  currentCity: string;
  pinCode: string;
  studyPreference: string;
}

const Register: React.FC = () => {
  const { register, sendOTP } = useAuth();
  const navigate = useNavigate();

  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    otp: '',
    currentCity: '',
    pinCode: '',
    studyPreference: ''
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSendOTP = async () => {
    if (!formData.email) {
      toast.error('Please enter your email');
      return;
    }

    try {
      setLoading(true);
      await sendOTP(formData.email);
      setOtpSent(true);
      toast.success('OTP sent to your email');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.otp ||
      !formData.currentCity ||
      !formData.pinCode
    ) {
      toast.error('Please fill all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!termsAccepted) {
      toast.error('Please accept Terms & Conditions');
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      otp: formData.otp,
      currentCity: formData.currentCity,
      pinCode: formData.pinCode,
      studyPreference: formData.studyPreference
    };

    try {
      setLoading(true);
      await register(payload);
      toast.success('Registration successful');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <div className="bg-green-600 p-3 rounded-2xl">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold">Join InternX</h2>
          <p className="text-gray-600">
            Create your account and start your journey
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Send OTP */}
            <button
              type="button"
              onClick={handleSendOTP}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>

            {/* OTP */}
            {otpSent && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter OTP *
                </label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500"
                />
              </div>
            )}

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded pr-10 focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Current City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current City *
              </label>
              <input
                type="text"
                name="currentCity"
                value={formData.currentCity}
                onChange={handleInputChange}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Pin Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pin Code *
              </label>
              <input
                type="text"
                name="pinCode"
                value={formData.pinCode}
                onChange={handleInputChange}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Study Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
             Career Path *
              </label>
              <select
                name="studyPreference"
                value={formData.studyPreference}
                onChange={handleInputChange}
                required
                className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500"
              >
                <option value="India">Study in India</option>
                <option value="Abroad">Study Abroad</option>
                <option value="Both">Both</option>
                <option value="Work">Work</option>
              </select>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={e => setTermsAccepted(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm text-gray-700">
                I accept the{' '}
                <a href="/privacy" className="text-green-600 underline">
                  Terms & Conditions
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-green-600 underline">
                  Privacy Policy
                </a>
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !termsAccepted}
              className="w-full bg-green-600 text-white py-3 rounded font-medium disabled:bg-gray-400"
            >
              Create Account
            </button>
          </form>

          <p className="text-center text-sm mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SEO from '../components/common/SEO';

const About = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const { apiCall } = useApi();

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await apiCall('/api/skills', 'GET');
        setSkills(response.data);
      } catch (error) {
        console.error('Error fetching skills:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <SEO 
        title="About - Portfolio"
        description="Learn more about my background, experience, and technical skills"
        keywords="about, experience, skills, developer, portfolio"
      />
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">About Me</h1>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
          </div>

          {/* Bio Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <img 
                  src="/my-photo-2.jpg" 
                  alt="Profile" 
                  className="rounded-lg shadow-md w-full"
                />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Hello, I'm [Sai Chandhan Reddy]</h2>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  I'm a passionate full-stack developer with expertise in modern web technologies. 
                  I love creating efficient, scalable, and user-friendly applications that solve 
                  real-world problems.
                </p>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  With experience in both frontend and backend development, I enjoy working on 
                  projects that challenge me to learn new technologies and improve my skills.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  When I'm not coding, you can find me exploring new technologies, contributing 
                  to open-source projects, or sharing knowledge with the developer community.
                </p>
              </div>
            </div>
          </div>

          {/* Experience Timeline */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Experience</h2>
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-4 h-4 bg-blue-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">Full Stack Developer Intern</h3>
                  <p className="text-gray-600 mb-2">Techsonix solutions • May 2025</p>
                  <p className="text-gray-700">
                    Led development of web applications using HTML, CSS, and JavaScript. 
                    Implemented best practices for code quality.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-4 h-4 bg-blue-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">Full Stack Developer</h3>
                  <p className="text-gray-600 mb-2">Startup Inc • 2024 - 2025</p>
                  <p className="text-gray-700">
                    Developed and maintained multiple client projects using modern JavaScript 
                    frameworks. Collaborated with designers and product managers to deliver 
                    high-quality solutions.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-4 h-4 bg-blue-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">Junior Developer</h3>
                  <p className="text-gray-600 mb-2">Tasque • 2024 - 2025</p>
                  <p className="text-gray-700">
                    Started my professional journey building responsive websites and learning 
                    modern development practices. Gained experience with various CMS platforms 
                    and frontend frameworks.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Technical Skills</h2>
            <div className="flex-shrink-0 w-4 h-4 bg-blue-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">MERN</h3>
                </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skills.map((skill) => (
                <div key={skill._id} className="text-center">
                  <div className="bg-gray-100 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 mb-2">{skill.name}</h3>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 mt-2 block">{skill.level}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education Section */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Education</h2>
            <div className="space-y-6">
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="text-xl font-semibold text-gray-900">Bachelor of Computer Science</h3>
                <p className="text-gray-600 mb-2">VIT-AP University • 2023 - 2027</p>
                <p className="text-gray-700">
                  Pursuing bachelor's degree. Focused on software engineering, algorithms, 
                  and web development technologies.
                </p>
              </div>
              
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="text-xl font-semibold text-gray-900">Relevant Certifications</h3>
                <ul className="text-gray-700 mt-2 space-y-1">
                  <li>• AWS Certified Cloud Practioner</li>
                  <li>• Oracle Certified Generative AI Professional</li>
                  <li>• Salesforce Certified AI Associate</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
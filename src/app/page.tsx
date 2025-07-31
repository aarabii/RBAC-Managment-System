"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Users,
  Key,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Lock,
} from "lucide-react";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-lg font-medium text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">
                RBAC Manager
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Button onClick={() => router.push("/dashboard")}>
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/login")}
                  >
                    Sign In
                  </Button>
                  <Button onClick={() => router.push("/login")}>
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Sparkles className="w-4 h-4 mr-1" />
            Advanced RBAC Management
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Manage Permissions &
            <br />
            <span className="text-blue-600">Roles with Ease</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A powerful web application to visually create, manage, and link
            permissions and roles. Features natural language commands powered by
            AI for seamless RBAC configuration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleGetStarted} className="px-8">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/login")}
            >
              <Lock className="mr-2 h-5 w-5" />
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Core Features
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage your application&apos;s role-based
            access control system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Permission Management */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Key className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Permission Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Create, read, update, and delete individual permissions with
                detailed descriptions.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Full CRUD operations
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Role assignments tracking
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Bulk operations support
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Role Management */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Role Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Define roles and easily assign multiple permissions with an
                intuitive interface.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Visual permission assignment
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Role hierarchy support
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  User assignment tracking
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Natural Language Config */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Natural Language Commands</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Use plain English to configure your RBAC system with AI-powered
                command parsing.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  AI-powered parsing
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Real-time execution
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Command history
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Built with Modern Technology
            </h2>
            <p className="text-lg text-gray-600">
              Powered by the latest web technologies for performance and
              reliability
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16  rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="100%"
                    height="100%"
                    viewBox="0 0 48 48"
                  >
                    <linearGradient
                      id="NRNx2IPDe7PJlJvrxOKgWa_MWiBjkuHeMVq_gr1"
                      x1="24"
                      x2="24"
                      y1="43.734"
                      y2="4.266"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0" stopColor="#0a070a"></stop>
                      <stop offset=".465" stopColor="#2b2b2b"></stop>
                      <stop offset="1" stopColor="#4b4b4b"></stop>
                    </linearGradient>
                    <circle
                      cx="24"
                      cy="24"
                      r="19.734"
                      fill="url(#NRNx2IPDe7PJlJvrxOKgWa_MWiBjkuHeMVq_gr1)"
                    ></circle>
                    <rect
                      width="3.023"
                      height="15.996"
                      x="15.992"
                      y="16.027"
                      fill="#fff"
                    ></rect>
                    <linearGradient
                      id="NRNx2IPDe7PJlJvrxOKgWb_MWiBjkuHeMVq_gr2"
                      x1="30.512"
                      x2="30.512"
                      y1="33.021"
                      y2="18.431"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop
                        offset=".377"
                        stopColor="#fff"
                        stopOpacity="0"
                      ></stop>
                      <stop
                        offset=".666"
                        stopColor="#fff"
                        stopOpacity=".3"
                      ></stop>
                      <stop offset=".988" stopColor="#fff"></stop>
                    </linearGradient>
                    <rect
                      width="2.953"
                      height="14.59"
                      x="29.035"
                      y="15.957"
                      fill="url(#NRNx2IPDe7PJlJvrxOKgWb_MWiBjkuHeMVq_gr2)"
                    ></rect>
                    <linearGradient
                      id="NRNx2IPDe7PJlJvrxOKgWc_MWiBjkuHeMVq_gr3"
                      x1="22.102"
                      x2="36.661"
                      y1="21.443"
                      y2="40.529"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset=".296" stopColor="#fff"></stop>
                      <stop
                        offset=".521"
                        stopColor="#fff"
                        stopOpacity=".5"
                      ></stop>
                      <stop
                        offset=".838"
                        stopColor="#fff"
                        stopOpacity="0"
                      ></stop>
                    </linearGradient>
                    <polygon
                      fill="url(#NRNx2IPDe7PJlJvrxOKgWc_MWiBjkuHeMVq_gr3)"
                      points="36.781,38.094 34.168,39.09 15.992,16.027 19.508,16.027"
                    ></polygon>
                  </svg>
                </span>
              </div>
              <h3 className="font-semibold text-gray-900">Next.js 15</h3>
              <p className="text-sm text-gray-600">React Framework</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16  rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="100%"
                    height="100%"
                    viewBox="0 0 48 48"
                  >
                    <g id="Ð¡Ð»Ð¾Ð¹_1">
                      <linearGradient
                        id="SVGID_1__sH0rW2TvYdr9_gr1"
                        x1="14.073"
                        x2="14.073"
                        y1="8.468"
                        y2="36.033"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop offset="0" stopColor="#7dffce"></stop>
                        <stop offset="1" stopColor="#50c08d"></stop>
                      </linearGradient>
                      <path
                        fill="url(#SVGID_1__sH0rW2TvYdr9_gr1)"
                        d="M24.2,30V6.3c0-1.8-2.3-2.6-3.4-1.2L4.5,25.9c-1.3,1.7-0.1,4.1,2,4.1H24.2z"
                      ></path>
                      <linearGradient
                        id="SVGID_00000140728474547789280440000018204366184369975479__sH0rW2TvYdr9_gr2"
                        x1="34.249"
                        x2="34.249"
                        y1="48.404"
                        y2="19.425"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop offset="0" stopColor="#7dffce"></stop>
                        <stop offset="1" stopColor="#50c08d"></stop>
                      </linearGradient>
                      <path
                        fill="url(#SVGID_00000140728474547789280440000018204366184369975479__sH0rW2TvYdr9_gr2)"
                        d="M24,18.4v23.7c0,1.8,2.4,2.6,3.5,1.2 l16.4-20.7c1.3-1.7,0.1-4.1-2.1-4.1H24z"
                      ></path>
                    </g>
                  </svg>
                </span>
              </div>
              <h3 className="font-semibold text-gray-900">Supabase</h3>
              <p className="text-sm text-gray-600">Database & Auth</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16  rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="100%"
                    height="100%"
                    viewBox="0 0 48 48"
                  >
                    <rect
                      width="36"
                      height="36"
                      x="6"
                      y="6"
                      fill="#1976d2"
                    ></rect>
                    <polygon
                      fill="#fff"
                      points="27.49,22 14.227,22 14.227,25.264 18.984,25.264 18.984,40 22.753,40 22.753,25.264 27.49,25.264"
                    ></polygon>
                    <path
                      fill="#fff"
                      d="M39.194,26.084c0,0-1.787-1.192-3.807-1.192s-2.747,0.96-2.747,1.986 c0,2.648,7.381,2.383,7.381,7.712c0,8.209-11.254,4.568-11.254,4.568V35.22c0,0,2.152,1.622,4.733,1.622s2.483-1.688,2.483-1.92 c0-2.449-7.315-2.449-7.315-7.878c0-7.381,10.658-4.469,10.658-4.469L39.194,26.084z"
                    ></path>
                  </svg>
                </span>
              </div>
              <h3 className="font-semibold text-gray-900">TypeScript</h3>
              <p className="text-sm text-gray-600">Type Safety</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="m19.01 11.55-7.46 7.46c-.46.46-.46 1.19 0 1.65a1.16 1.16 0 0 0 1.64 0l7.46-7.46c.46-.46.46-1.19 0-1.65s-1.19-.46-1.65 0ZM19.17 3.34c-.46-.46-1.19-.46-1.65 0L3.34 17.52c-.46.46-.46 1.19 0 1.65a1.16 1.16 0 0 0 1.64 0L19.16 4.99c.46-.46.46-1.19 0-1.65Z"
                      className="b"
                    ></path>
                  </svg>
                </span>
              </div>
              <h3 className="font-semibold text-gray-900">Shadcn/ui</h3>
              <p className="text-sm text-gray-600">UI Components</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Simplify Your RBAC Management?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Get started today and experience the power of visual role and
              permission management.
            </p>
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8"
            >
              Start Managing Roles
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-blue-600 mr-2" />
              <span className="font-semibold text-gray-900">RBAC Manager</span>
            </div>
            <div className="text-sm text-gray-600">
              Built with Next.js, Supabase, and TypeScript
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

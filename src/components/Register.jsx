import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { registerUser } from '../lib/auth';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiAlertCircle } = FiIcons;

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'User',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: 'Passwort eingeben',
    color: 'text-slate-400',
  });

  const roles = ['Superadmin', 'Owner', 'Admin', 'User'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Simple password strength check
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    let score = 0;
    let message = '';
    let color = '';

    if (password.length === 0) {
      message = 'Passwort eingeben';
      color = 'text-slate-400';
    } else if (password.length < 6) {
      score = 1;
      message = 'Sehr schwach';
      color = 'text-red-500';
    } else if (password.length < 8) {
      score = 2;
      message = 'Schwach';
      color = 'text-orange-500';
    } else {
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

      const passedTests = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars].filter(Boolean).length;

      if (passedTests === 4 && password.length >= 10) {
        score = 5;
        message = 'Sehr stark';
        color = 'text-green-500';
      } else if (passedTests >= 3) {
        score = 4;
        message = 'Stark';
        color = 'text-green-400';
      } else if (passedTests >= 2) {
        score = 3;
        message = 'Mittel';
        color = 'text-yellow-400';
      }
    }

    setPasswordStrength({ score, message, color });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Form validation
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }

    if (formData.password.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein');
      return;
    }

    setIsLoading(true);
    try {
      const result = await registerUser(formData.email, formData.password, formData.role);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Registration successful
      navigate('/login', { 
        state: { 
          message: 'Registrierung erfolgreich! Sie können sich jetzt anmelden.' 
        } 
      });
    } catch (err) {
      setError(err.message || 'Bei der Registrierung ist ein Fehler aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4"
          >
            <span className="text-2xl font-bold text-white">M</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Manage.tools</h1>
          <p className="text-slate-400">Erstellen Sie ein neues Konto</p>
        </div>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
                E-Mail-Adresse
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SafeIcon icon={FiMail} className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-white/20 rounded-xl bg-white/5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="ihre@email.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
                Passwort
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SafeIcon icon={FiLock} className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-12 py-3 border border-white/20 rounded-xl bg-white/5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Ihr Passwort"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors duration-200"
                >
                  <SafeIcon 
                    icon={showPassword ? FiEyeOff : FiEye} 
                    className="h-5 w-5" 
                  />
                </button>
              </div>
              {/* Password strength indicator */}
              <div className="mt-1 flex items-center">
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      passwordStrength.score === 1 ? 'bg-red-500' :
                      passwordStrength.score === 2 ? 'bg-orange-500' :
                      passwordStrength.score === 3 ? 'bg-yellow-400' :
                      passwordStrength.score === 4 ? 'bg-green-400' :
                      passwordStrength.score === 5 ? 'bg-green-500' : 'bg-transparent'
                    }`}
                    style={{ width: `${passwordStrength.score * 20}%` }}
                  />
                </div>
                <span className={`ml-2 text-xs ${passwordStrength.color}`}>
                  {passwordStrength.message}
                </span>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-200 mb-2">
                Passwort bestätigen
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SafeIcon icon={FiLock} className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-12 py-3 border border-white/20 rounded-xl bg-white/5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Passwort bestätigen"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors duration-200"
                >
                  <SafeIcon 
                    icon={showConfirmPassword ? FiEyeOff : FiEye} 
                    className="h-5 w-5" 
                  />
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-200 mb-2">
                Rolle
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SafeIcon icon={FiUser} className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-white/20 rounded-xl bg-white/5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
                >
                  {roles.map((role) => (
                    <option key={role} value={role} className="bg-slate-800 text-white">
                      {role}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <SafeIcon icon={FiIcons.FiChevronDown} className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-start"
              >
                <SafeIcon icon={FiAlertCircle} className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-red-200">{error}</span>
              </motion.div>
            )}

            {/* Register Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Registrieren'
              )}
            </motion.button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Sie haben bereits ein Konto?{' '}
              <a
                href="#/login"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
              >
                Anmelden
              </a>
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-8 text-center text-slate-500 text-sm"
        >
          <p>&copy; 2025 Manage.tools. Alle Rechte vorbehalten.</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
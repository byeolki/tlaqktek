"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, User, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ChangePasswordRequest } from '../../lib/types';
import Header from '../../components/Header';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function SettingsPage() {
    const router = useRouter();
    const { user, changePassword } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        if (!user) {
            router.replace('/login');
        }
    }, [user, router]);

    const validatePasswordForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!passwordForm.current_password) {
            newErrors.current_password = '현재 비밀번호를 입력해주세요';
        }

        if (!passwordForm.new_password) {
            newErrors.new_password = '새 비밀번호를 입력해주세요';
        } else if (passwordForm.new_password.length < 8) {
            newErrors.new_password = '새 비밀번호는 8자 이상이어야 합니다';
        }

        if (!passwordForm.confirm_password) {
            newErrors.confirm_password = '새 비밀번호 확인을 입력해주세요';
        } else if (passwordForm.new_password !== passwordForm.confirm_password) {
            newErrors.confirm_password = '새 비밀번호가 일치하지 않습니다';
        }

        if (passwordForm.current_password === passwordForm.new_password) {
            newErrors.new_password = '현재 비밀번호와 새 비밀번호가 동일합니다';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');
        setPasswordChangeSuccess(false);

        if (!validatePasswordForm()) {
            return;
        }

        setIsChangingPassword(true);

        try {
            const changeData: ChangePasswordRequest = {
                current_password: passwordForm.current_password,
                new_password: passwordForm.new_password
            };

            await changePassword(changeData);
            setPasswordChangeSuccess(true);
            setPasswordForm({
                current_password: '',
                new_password: '',
                confirm_password: ''
            });
            setErrors({});
        } catch (error: any) {
            setSubmitError(error.message || '비밀번호 변경에 실패했습니다');
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handlePasswordFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear errors when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Clear success and error messages
        if (passwordChangeSuccess) {
            setPasswordChangeSuccess(false);
        }
        if (submitError) {
            setSubmitError('');
        }
    };

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const getPasswordStrength = (password: string) => {
        if (!password) return { strength: 0, label: '', color: '' };

        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;

        const levels = [
            { strength: 0, label: '', color: '' },
            { strength: 1, label: '매우 약함', color: 'bg-red-500' },
            { strength: 2, label: '약함', color: 'bg-orange-500' },
            { strength: 3, label: '보통', color: 'bg-yellow-500' },
            { strength: 4, label: '강함', color: 'bg-green-500' },
            { strength: 5, label: '매우 강함', color: 'bg-green-600' }
        ];

        return levels[strength];
    };

    const passwordStrength = getPasswordStrength(passwordForm.new_password);

    if (!user) {
        return null;
    }

    const tabs = [
        { id: 'profile', name: '프로필', icon: User },
        { id: 'password', name: '비밀번호 변경', icon: Lock },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">설정</h1>
                    <p className="text-gray-600">계정 정보를 관리하고 보안 설정을 변경하세요.</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm">
                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as 'profile' | 'password')}
                                        className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                            activeTab === tab.id
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{tab.name}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">프로필 정보</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                사용자 ID
                                            </label>
                                            <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                                                {user.user_id}
                                            </div>
                                            <p className="mt-1 text-sm text-gray-500">
                                                사용자 ID는 변경할 수 없습니다.
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                계정 ID
                                            </label>
                                            <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                                                #{user.id}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                    <div className="flex">
                                        <AlertCircle className="h-5 w-5 text-blue-400" />
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-blue-800">
                                                계정 정보
                                            </h3>
                                            <div className="mt-1 text-sm text-blue-700">
                                                현재 버전에서는 프로필 정보 수정 기능이 제한되어 있습니다.
                                                추후 업데이트를 통해 제공될 예정입니다.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'password' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">비밀번호 변경</h3>
                                    <p className="text-gray-600 mb-6">
                                        보안을 위해 정기적으로 비밀번호를 변경하는 것을 권장합니다.
                                    </p>
                                </div>

                                <form onSubmit={handlePasswordChange} className="space-y-6">
                                    {/* Success Message */}
                                    {passwordChangeSuccess && (
                                        <div className="bg-green-50 border border-green-200 rounded-md p-4">
                                            <div className="flex">
                                                <CheckCircle className="h-5 w-5 text-green-400" />
                                                <div className="ml-3">
                                                    <h3 className="text-sm font-medium text-green-800">
                                                        비밀번호 변경 완료
                                                    </h3>
                                                    <div className="mt-1 text-sm text-green-700">
                                                        비밀번호가 성공적으로 변경되었습니다.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Error Message */}
                                    {submitError && (
                                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                            <div className="flex">
                                                <AlertCircle className="h-5 w-5 text-red-400" />
                                                <div className="ml-3">
                                                    <h3 className="text-sm font-medium text-red-800">
                                                        비밀번호 변경 실패
                                                    </h3>
                                                    <div className="mt-1 text-sm text-red-700">
                                                        {submitError}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Current Password */}
                                    <div>
                                        <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">
                                            현재 비밀번호
                                        </label>
                                        <div className="mt-1 relative">
                                            <input
                                                id="current_password"
                                                name="current_password"
                                                type={showPasswords.current ? 'text' : 'password'}
                                                value={passwordForm.current_password}
                                                onChange={handlePasswordFormChange}
                                                className={`block w-full px-3 py-2 pr-10 border ${
                                                    errors.current_password ? 'border-red-300' : 'border-gray-300'
                                                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                                placeholder="현재 비밀번호를 입력하세요"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => togglePasswordVisibility('current')}
                                            >
                                                {showPasswords.current ? (
                                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.current_password && (
                                            <p className="mt-1 text-sm text-red-600">{errors.current_password}</p>
                                        )}
                                    </div>

                                    {/* New Password */}
                                    <div>
                                        <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                                            새 비밀번호
                                        </label>
                                        <div className="mt-1 relative">
                                            <input
                                                id="new_password"
                                                name="new_password"
                                                type={showPasswords.new ? 'text' : 'password'}
                                                value={passwordForm.new_password}
                                                onChange={handlePasswordFormChange}
                                                className={`block w-full px-3 py-2 pr-10 border ${
                                                    errors.new_password ? 'border-red-300' : 'border-gray-300'
                                                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                                placeholder="새 비밀번호를 입력하세요"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => togglePasswordVisibility('new')}
                                            >
                                                {showPasswords.new ? (
                                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.new_password && (
                                            <p className="mt-1 text-sm text-red-600">{errors.new_password}</p>
                                        )}

                                        {/* Password Strength Indicator */}
                                        {passwordForm.new_password && !errors.new_password && (
                                            <div className="mt-2">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs text-gray-500">비밀번호 강도</span>
                                                    <span className={`text-xs font-medium ${
                                                        passwordStrength.strength >= 3 ? 'text-green-600' :
                                                        passwordStrength.strength >= 2 ? 'text-yellow-600' : 'text-red-600'
                                                    }`}>
                                                        {passwordStrength.label}
                                                    </span>
                                                </div>
                                                <div className="flex space-x-1">
                                                    {[1, 2, 3, 4, 5].map((level) => (
                                                        <div
                                                            key={level}
                                                            className={`h-2 w-full rounded ${
                                                                level <= passwordStrength.strength
                                                                    ? passwordStrength.color
                                                                    : 'bg-gray-200'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                                            새 비밀번호 확인
                                        </label>
                                        <div className="mt-1 relative">
                                            <input
                                                id="confirm_password"
                                                name="confirm_password"
                                                type={showPasswords.confirm ? 'text' : 'password'}
                                                value={passwordForm.confirm_password}
                                                onChange={handlePasswordFormChange}
                                                className={`block w-full px-3 py-2 pr-10 border ${
                                                    errors.confirm_password ? 'border-red-300' : 'border-gray-300'
                                                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                                placeholder="새 비밀번호를 다시 입력하세요"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => togglePasswordVisibility('confirm')}
                                            >
                                                {showPasswords.confirm ? (
                                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.confirm_password && (
                                            <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>
                                        )}
                                        {passwordForm.confirm_password && passwordForm.new_password === passwordForm.confirm_password && !errors.confirm_password && (
                                            <div className="mt-1 flex items-center">
                                                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                                <span className="text-sm text-green-600">비밀번호가 일치합니다</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={isChangingPassword}
                                            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {isChangingPassword ? (
                                                <div className="flex items-center space-x-2">
                                                    <LoadingSpinner size="sm" color="white" />
                                                    <span>변경 중...</span>
                                                </div>
                                            ) : (
                                                '비밀번호 변경'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

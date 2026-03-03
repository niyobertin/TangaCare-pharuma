import { createRoute, Navigate } from '@tanstack/react-router';
import { LoginPage } from '../../pages/auth/LoginPage';
import { RegisterPage } from '../../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../../pages/auth/ForgotPasswordPage';
import { VerifyOtpPage } from '../../pages/auth/VerifyOtpPage';
import { ResetPasswordPage } from '../../pages/auth/ResetPasswordPage';
import { SetPasswordPage } from '../../pages/auth/SetPasswordPage';
import { z } from 'zod';
// import React from 'react';

export const createAuthRoutes = (parentRoute: any, _rootRoute: any) => {
    const authIndexRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: '/',
        component: () => <Navigate to={"/auth/login" as any} search={{} as any} />,
    });

    const loginRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'login',
        component: LoginPage,
        validateSearch: (search: Record<string, unknown>) => {
            return z
                .object({
                    redirect: z.string().optional(),
                })
                .parse(search);
        },
    });

    const registerRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'register',
        component: RegisterPage,
        validateSearch: (search: Record<string, unknown>) => {
            return z
                .object({
                    role: z.string().optional(),
                    inviteCode: z.string().optional(),
                })
                .parse(search);
        },
    });

    const forgotPasswordRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'forgot-password',
        component: ForgotPasswordPage,
    });

    const verifyOtpRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'verify-otp',
        component: VerifyOtpPage,
        validateSearch: (search: Record<string, unknown>) => {
            return z
                .object({
                    email: z.string().optional(),
                })
                .parse(search);
        },
    });

    const resetPasswordRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'reset-password',
        component: ResetPasswordPage,
        validateSearch: (search: Record<string, unknown>) => {
            return z
                .object({
                    email: z.string().optional(),
                    otp: z.string().optional(),
                })
                .parse(search);
        },
    });

    const setPasswordRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: 'set-password',
        component: SetPasswordPage,
    });

    return [
        authIndexRoute,
        loginRoute,
        registerRoute,
        forgotPasswordRoute,
        verifyOtpRoute,
        resetPasswordRoute,
        setPasswordRoute,
    ];
};

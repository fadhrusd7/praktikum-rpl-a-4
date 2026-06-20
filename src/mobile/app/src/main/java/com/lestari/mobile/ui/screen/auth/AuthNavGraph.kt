package com.lestari.mobile.ui.screen.auth

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.compose.ui.platform.LocalContext
import com.lestari.mobile.controller.AppController
import com.lestari.mobile.ui.app.LestariUserApp
import com.lestari.mobile.data.TokenPreferences
import com.lestari.mobile.data.api.RetrofitClient
import com.lestari.mobile.data.repository.UserRepository
import com.lestari.mobile.ui.screen.profile.ChangePasswordScreen
import com.lestari.mobile.ui.screen.profile.FeedbackScreen
import com.lestari.mobile.ui.viewmodel.ChangePasswordViewModel
import com.lestari.mobile.ui.viewmodel.ChangePasswordViewModel.ChangePasswordViewModelFactory
import com.lestari.mobile.ui.viewmodel.FeedbackViewModel
import com.lestari.mobile.ui.viewmodel.FeedbackViewModelFactory

object AuthRoutes {
    const val LOGIN              = "login"
    const val REGISTER           = "register"
    const val FORGOT_PASSWORD    = "forgot_password"
    const val OTP_VERIFICATION   = "otp_verification/{email}"
    // ── Baru: route OTP khusus setelah registrasi ─────────────────────────────
    const val REGISTER_OTP       = "register_otp/{email}"
    const val REGISTER_SUCCESS   = "register_success"
    const val RESET_PASSWORD     = "reset_password/{email}/{token}"
    const val PASSWORD_SUCCESS   = "password_success"
    const val CHANGE_PASSWORD    = "change_password"
    const val FEEDBACK           = "feedback"
    const val MAIN               = "main"

    fun otpRoute(email: String)         = "otp_verification/$email"
    fun registerOtpRoute(email: String) = "register_otp/$email"          // ← baru
    fun resetPasswordRoute(email: String, token: String) = "reset_password/$email/$token"
}

@Composable
fun AuthNavGraph(
    navController: NavHostController = rememberNavController(),
    startDestination: String         = AuthRoutes.LOGIN
) {
    NavHost(navController = navController, startDestination = startDestination) {

        composable(AuthRoutes.LOGIN) {
            LoginScreen(
                navController              = navController,
                onNavigateToForgotPassword = { navController.navigate(AuthRoutes.FORGOT_PASSWORD) }
            )
        }

        composable(AuthRoutes.REGISTER) {
            RegisterScreen(navController = navController)
        }

        // ── OTP setelah registrasi (flow baru) ────────────────────────────────
        composable(AuthRoutes.REGISTER_OTP) { backStackEntry ->
            val email = backStackEntry.arguments?.getString("email") ?: ""
            OtpVerificationScreen(
                navController = navController,
                targetEmail   = email
            )
        }

        // ── OTP untuk reset password (flow lama, tidak diubah) ────────────────
        composable(AuthRoutes.FORGOT_PASSWORD) {
            ForgotPasswordScreen(
                onSendOtp = { email ->
                    navController.navigate(AuthRoutes.otpRoute(email))
                }
            )
        }

        composable(AuthRoutes.OTP_VERIFICATION) { backStackEntry ->
            val email = backStackEntry.arguments?.getString("email") ?: ""
            OtpVerificationScreen(
                navController        = navController,
                targetEmail          = email,
                isForgotPasswordFlow = true
            )
        }

        composable(AuthRoutes.RESET_PASSWORD) { backStackEntry ->
            val email = backStackEntry.arguments?.getString("email") ?: ""
            val token = backStackEntry.arguments?.getString("token") ?: ""
            ResetPasswordScreen(
                targetEmail = email,
                resetToken  = token,
                onSavePasswordSuccess = {
                    navController.navigate(AuthRoutes.PASSWORD_SUCCESS) {
                        popUpTo(AuthRoutes.FORGOT_PASSWORD) { inclusive = true }
                    }
                }
            )
        }

        composable(AuthRoutes.REGISTER_SUCCESS) {
            val context = LocalContext.current
            val tokenPreferences = remember { TokenPreferences(context) }
            val isLoggedIn = tokenPreferences.isLoggedIn()

            RegisterSuccessScreen(
                isLoggedIn = isLoggedIn,
                onContinue = {
                    if (isLoggedIn) {
                        navController.navigate(AuthRoutes.MAIN) {
                            popUpTo(0) { inclusive = true }
                        }
                    } else {
                        navController.navigate(AuthRoutes.LOGIN) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                }
            )
        }

        composable(AuthRoutes.PASSWORD_SUCCESS) {
            PasswordSuccessScreen(
                onBackToLogin = {
                    navController.navigate(AuthRoutes.LOGIN) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        composable(AuthRoutes.CHANGE_PASSWORD) {
            val context  = LocalContext.current
            val changeVm = viewModel<ChangePasswordViewModel>(factory = ChangePasswordViewModelFactory(context))
            ChangePasswordScreen(
                onNavigateBack   = { navController.popBackStack() },
                onAccountDeleted = {
                    navController.navigate("login") {
                        popUpTo(0) { inclusive = true }   // hapus seluruh back stack
                        launchSingleTop = true
                    }
                },
                viewModel = changeVm,
            )
        }

        composable(AuthRoutes.FEEDBACK) {
            val context          = LocalContext.current
            val tokenPreferences = remember { TokenPreferences(context) }
            val token            = tokenPreferences.getToken() ?: ""
            val userRepository   = remember { UserRepository(RetrofitClient.userApiService, token, context) }
            val feedbackVm: FeedbackViewModel = viewModel(factory = FeedbackViewModelFactory(userRepository))
            FeedbackScreen(
                onNavigateBack = { navController.popBackStack() },
                viewModel      = feedbackVm
            )
        }

        composable(AuthRoutes.MAIN) {
            val appController = remember { AppController() }
            LestariUserApp(controller = appController, navController = navController)
        }
    }
}
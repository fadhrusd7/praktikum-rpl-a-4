package com.lestari.mobile.ui.screen.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.MarkEmailRead
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.lestari.mobile.ui.component.AuthIllustrationIcon
import com.lestari.mobile.ui.theme.AppColors
import com.lestari.mobile.ui.viewmodel.AuthViewModel
import com.lestari.mobile.ui.viewmodel.AuthViewModelFactory
import kotlinx.coroutines.delay

private const val OTP_LENGTH      = 6
private const val RESEND_COOLDOWN = 60 // detik

@Composable
fun OtpVerificationScreen(
    navController: NavController,
    targetEmail: String,
    isForgotPasswordFlow: Boolean = false
) {
    val context   = LocalContext.current
    val viewModel: AuthViewModel = viewModel(factory = AuthViewModelFactory(context))
    val uiState   by viewModel.uiState.collectAsStateWithLifecycle()

    val keyboardController = LocalSoftwareKeyboardController.current
    val focusManager = LocalFocusManager.current

    // ── OTP input state ───────────────────────────────────────────────────────
    var otpValue        by remember { mutableStateOf("") }
    val focusRequester  = remember { FocusRequester() }
    var isTextFieldFocused by remember { mutableStateOf(false) }

    // ── Countdown kirim ulang ─────────────────────────────────────────────────
    var countdown       by remember { mutableIntStateOf(RESEND_COOLDOWN) }
    val canResend       = countdown == 0

    LaunchedEffect(Unit) {
        focusRequester.requestFocus()
    }

    LaunchedEffect(countdown) {
        if (countdown > 0) {
            delay(1000L)
            countdown--
        }
    }

    val snackbarHostState = remember { SnackbarHostState() }

    // ── Navigasi setelah OTP terverifikasi ────────────────────────────────────
    LaunchedEffect(uiState.otpVerified, uiState.resetOtpVerified, uiState.resetToken) {
        if (!isForgotPasswordFlow && uiState.otpVerified) {
            snackbarHostState.showSnackbar(
                message  = "Email berhasil diverifikasi! Silakan masuk.",
                duration = SnackbarDuration.Short
            )
            navController.navigate(AuthRoutes.LOGIN) {
                popUpTo(0) { inclusive = true }
            }
            viewModel.resetState()
        } else if (isForgotPasswordFlow && uiState.resetOtpVerified && uiState.resetToken != null) {
            snackbarHostState.showSnackbar(
                message  = "Email berhasil diverifikasi!",
                duration = SnackbarDuration.Short
            )
            navController.navigate(AuthRoutes.resetPasswordRoute(targetEmail, uiState.resetToken!!)) {
                popUpTo(AuthRoutes.FORGOT_PASSWORD) { inclusive = true }
            }
            viewModel.resetState()
        }
    }

    // ── Tampilkan error ───────────────────────────────────────────────────────
    LaunchedEffect(uiState.errorMessage) {
        uiState.errorMessage?.let { msg ->
            snackbarHostState.showSnackbar(message = msg, duration = SnackbarDuration.Short)
            viewModel.clearError()
            // Reset kotak OTP saat error
            otpValue = ""
        }
    }

    // ── Reset countdown setelah resend sukses ─────────────────────────────────
    LaunchedEffect(uiState.resendSuccess, uiState.forgotPasswordSuccess) {
        if (uiState.resendSuccess) {
            countdown = RESEND_COOLDOWN
            snackbarHostState.showSnackbar(
                message  = "Kode OTP baru telah dikirim ke $targetEmail",
                duration = SnackbarDuration.Short
            )
            viewModel.clearResend()
        } else if (isForgotPasswordFlow && uiState.forgotPasswordSuccess) {
            countdown = RESEND_COOLDOWN
            snackbarHostState.showSnackbar(
                message  = "Kode OTP baru telah dikirim ke $targetEmail",
                duration = SnackbarDuration.Short
            )
            viewModel.resetState()
        }
    }

    Scaffold(snackbarHost = { SnackbarHost(snackbarHostState) }) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(AppColors.Page)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(Modifier.height(64.dp))

            // ── Ikon ilustrasi ────────────────────────────────────────────────
            AuthIllustrationIcon(imageVector = Icons.Outlined.MarkEmailRead)

            Spacer(Modifier.height(24.dp))

            Text(
                text      = "Verifikasi Email",
                style     = MaterialTheme.typography.headlineSmall.copy(
                    fontWeight = FontWeight.Bold,
                    color      = AppColors.TextPrimary
                ),
                textAlign = TextAlign.Center
            )

            Spacer(Modifier.height(8.dp))

            Text(
                text      = "Masukkan 6 digit kode yang dikirim ke",
                style     = MaterialTheme.typography.bodyMedium.copy(color = AppColors.Muted),
                textAlign = TextAlign.Center
            )
            Text(
                text      = targetEmail,
                style     = MaterialTheme.typography.bodyMedium.copy(
                    color      = AppColors.Forest,
                    fontWeight = FontWeight.SemiBold
                ),
                textAlign = TextAlign.Center
            )

            Spacer(Modifier.height(40.dp))

            // ── 6 kotak OTP ───────────────────────────────────────────────────
            // Hidden BasicTextField + custom visual boxes
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { 
                        focusManager.clearFocus()
                        focusRequester.requestFocus()
                        keyboardController?.show()
                    }
            ) {
                BasicTextField(
                    value         = otpValue,
                    onValueChange = { input ->
                        val filtered = input.filter { it.isDigit() }.take(OTP_LENGTH)
                        otpValue = filtered
                    },
                    modifier        = Modifier
                        .focusRequester(focusRequester)
                        .onFocusChanged { isTextFieldFocused = it.isFocused }
                        .size(1.dp), // tetap kecil tapi ada di dalam box yang bisa diklik
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    singleLine      = true
                )
                Row(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    modifier              = Modifier.fillMaxWidth()
                ) {
                    repeat(OTP_LENGTH) { index ->
                        val char    = otpValue.getOrNull(index)
                        val isFocus = isTextFieldFocused && index == otpValue.length && otpValue.length < OTP_LENGTH
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .aspectRatio(1f)
                                .clip(RoundedCornerShape(10.dp))
                                .background(Color.White)
                                .border(
                                    width = if (isFocus) 2.dp else 1.dp,
                                    color = when {
                                        isFocus    -> AppColors.Forest
                                        char != null -> AppColors.Forest.copy(alpha = 0.6f)
                                        else       -> AppColors.Border
                                    },
                                    shape = RoundedCornerShape(10.dp)
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text       = char?.toString() ?: "",
                                style      = MaterialTheme.typography.titleLarge.copy(
                                    fontWeight = FontWeight.Bold,
                                    color      = AppColors.TextPrimary,
                                    textAlign  = TextAlign.Center
                                )
                            )
                        }
                    }
                }
            }

            Spacer(Modifier.height(36.dp))

            // ── Tombol Verifikasi ─────────────────────────────────────────────
            Button(
                onClick  = {
                    if (isForgotPasswordFlow) {
                        viewModel.verifyResetOtp(targetEmail, otpValue)
                    } else {
                        viewModel.verifyOtp(targetEmail, otpValue)
                    }
                },
                enabled  = otpValue.length == OTP_LENGTH && !uiState.isLoading,
                modifier = Modifier.fillMaxWidth().height(52.dp),
                shape    = RoundedCornerShape(12.dp),
                colors   = ButtonDefaults.buttonColors(containerColor = AppColors.Forest)
            ) {
                if (uiState.isLoading) {
                    CircularProgressIndicator(modifier = Modifier.size(22.dp), color = Color.White, strokeWidth = 2.dp)
                } else {
                    Text(
                        "Verifikasi Kode",
                        style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.SemiBold, color = Color.White)
                    )
                }
            }

            Spacer(Modifier.height(24.dp))

            // ── Kirim ulang OTP ───────────────────────────────────────────────
            Row(
                verticalAlignment     = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                Text(
                    text  = "Belum menerima kode?  ",
                    style = MaterialTheme.typography.bodySmall.copy(color = AppColors.Muted)
                )
                if (!canResend) {
                    Text(
                        text  = "Kirim ulang dalam ${countdown}s",
                        style = MaterialTheme.typography.bodySmall.copy(color = AppColors.Muted)
                    )
                } else {
                    Text(
                        text     = "Kirim ulang",
                        style    = MaterialTheme.typography.bodySmall.copy(
                            color      = AppColors.Forest,
                            fontWeight = FontWeight.SemiBold
                        ),
                        modifier = Modifier.clickable {
                            if (!uiState.isLoading) {
                                if (isForgotPasswordFlow) {
                                    viewModel.forgotPassword(targetEmail)
                                } else {
                                    viewModel.resendOtp(targetEmail)
                                }
                            }
                        }
                    )
                }
            }

            Spacer(Modifier.height(16.dp))

            // ── Ganti email / kembali ─────────────────────────────────────────
            Text(
                text     = if (isForgotPasswordFlow) "Salah email? Kembali ke lupa kata sandi" else "Salah email? Kembali ke registrasi",
                style    = MaterialTheme.typography.bodySmall.copy(
                    color      = AppColors.Muted,
                    fontWeight = FontWeight.Medium
                ),
                modifier = Modifier.clickable {
                    if (isForgotPasswordFlow) {
                        navController.navigate(AuthRoutes.FORGOT_PASSWORD) {
                            popUpTo(AuthRoutes.FORGOT_PASSWORD) { inclusive = true }
                        }
                    } else {
                        navController.navigate(AuthRoutes.REGISTER) {
                            popUpTo(AuthRoutes.REGISTER) { inclusive = true }
                        }
                    }
                }
            )

            Spacer(Modifier.height(32.dp))
        }
    }
}
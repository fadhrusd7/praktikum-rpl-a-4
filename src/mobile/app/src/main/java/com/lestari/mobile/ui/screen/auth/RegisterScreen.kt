package com.lestari.mobile.ui.screen.auth

import android.util.Patterns
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Visibility
import androidx.compose.material.icons.outlined.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.lestari.mobile.R
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.lestari.mobile.ui.component.AuthDivider
import com.lestari.mobile.ui.component.AuthTextField
import com.lestari.mobile.ui.component.GoogleAuthWebView
import com.lestari.mobile.ui.theme.AppColors
import com.lestari.mobile.ui.theme.Poppins
import com.lestari.mobile.ui.viewmodel.AuthViewModel
import com.lestari.mobile.ui.viewmodel.AuthViewModelFactory

@Composable
fun RegisterScreen(navController: NavController) {
    val context = LocalContext.current
    val viewModel: AuthViewModel = viewModel(factory = AuthViewModelFactory(context))
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    var namaLengkap        by remember { mutableStateOf("") }
    var email              by remember { mutableStateOf("") }
    var password           by remember { mutableStateOf("") }
    var confirmPassword    by remember { mutableStateOf("") }
    var passwordVisible    by remember { mutableStateOf(false) }
    var confirmPassVisible by remember { mutableStateOf(false) }

    // ── Inline validasi email ─────────────────────────────────────────────────
    val emailError = remember(email) {
        when {
            email.isBlank() -> null
            !Patterns.EMAIL_ADDRESS.matcher(email).matches() -> "Format email tidak valid"
            else -> null
        }
    }

    val snackbarHostState = remember { SnackbarHostState() }

    // ── Navigasi ke OTP atau Success setelah register sukses ──────────────────
    LaunchedEffect(uiState.registerSuccess) {
        if (uiState.registerSuccess) {
            if (uiState.isGoogleAuth) {
                // Daftar via Google hanya membuat akun, lalu pengguna harus masuk lagi.
                navController.navigate(AuthRoutes.LOGIN) {
                    popUpTo(AuthRoutes.REGISTER) { inclusive = true }
                }
            } else if (uiState.registeredEmail != null) {
                // Jika daftar manual, ke layar OTP
                navController.navigate(AuthRoutes.registerOtpRoute(uiState.registeredEmail!!)) {
                    popUpTo(AuthRoutes.REGISTER) { inclusive = true }
                }
            }
            viewModel.resetState()
        }
    }

    // Hapus LaunchedEffect(uiState.loginSuccess) di sini agar tidak langsung ke Home


    LaunchedEffect(uiState.errorMessage) {
        uiState.errorMessage?.let { msg ->
            snackbarHostState.showSnackbar(message = msg, duration = SnackbarDuration.Short)
            viewModel.clearError()
        }
    }

    // ── Google Sign-In: WebView modal (Sama dengan Login) ─────────────────────
    val googleAuthUrl = uiState.googleAuthUrl
    if (googleAuthUrl != null) {
        Dialog(
            onDismissRequest = { viewModel.dismissGoogleAuthWebView() },
            properties = DialogProperties(
                usePlatformDefaultWidth = false,
                dismissOnBackPress = true,
                dismissOnClickOutside = false
            )
        ) {
            GoogleAuthWebView(
                authUrl  = googleAuthUrl,
                onResult = { result -> viewModel.handleGoogleAuthResult(result) }
            )
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
            Spacer(Modifier.height(16.dp))

            Row(
                modifier             = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Start,
                verticalAlignment    = Alignment.CenterVertically
            ) {
                Image(
                    painter            = painterResource(id = R.drawable.logo_lestari),
                    contentDescription = "Logo Lestari",
                    modifier           = Modifier.size(32.dp)
                )
                Spacer(Modifier.width(8.dp))
                Text(
                    text       = "Lestari",
                    fontFamily = Poppins,
                    fontWeight = FontWeight.Bold,
                    fontSize   = 24.sp,
                    color      = Color(0xFF17682F)
                )
            }

            Spacer(Modifier.height(48.dp))

            Text(
                text  = "Buat akun baru",
                style = MaterialTheme.typography.bodyLarge.copy(
                    color      = AppColors.TextPrimary,
                    fontWeight = FontWeight.Bold,
                    fontSize   = 24.sp
                )
            )

            Spacer(Modifier.height(8.dp))

            Text(
                text  = "Mulai berkontribusi untuk lingkungan",
                style = MaterialTheme.typography.bodyMedium.copy(color = AppColors.Muted)
            )

            Spacer(Modifier.height(36.dp))

            // ── Username ──────────────────────────────────────────────────────
            AuthTextField(
                value         = namaLengkap,
                onValueChange = { namaLengkap = it },
                label         = "Nama Lengkap",
                placeholder   = "Nama Lengkap",
                leadingIcon   = {
                    Icon(Icons.Outlined.Person, null, tint = AppColors.Muted, modifier = Modifier.size(20.dp))
                }
            )

            Spacer(Modifier.height(16.dp))

            // ── Email + validasi inline ───────────────────────────────────────
            AuthTextField(
                value           = email,
                onValueChange   = { email = it },
                label           = "Email",
                placeholder     = "contoh@gmail.com",
                isError         = emailError != null,
                errorMessage = emailError,
                leadingIcon     = {
                    Icon(Icons.Outlined.Email, null, tint = if (emailError != null) MaterialTheme.colorScheme.error else AppColors.Muted, modifier = Modifier.size(20.dp))
                },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
            )

            Spacer(Modifier.height(16.dp))

            // ── Password ──────────────────────────────────────────────────────
            AuthTextField(
                value                = password,
                onValueChange        = { password = it },
                label                = "Kata Sandi",
                placeholder          = "••••••••",
                leadingIcon          = {
                    Icon(Icons.Outlined.Lock, null, tint = AppColors.Muted, modifier = Modifier.size(20.dp))
                },
                trailingIcon = {
                    IconButton(onClick = { passwordVisible = !passwordVisible }) {
                        Icon(
                            imageVector = if (passwordVisible) Icons.Outlined.Visibility else Icons.Outlined.VisibilityOff,
                            contentDescription = null,
                            tint     = AppColors.Muted,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                },
                visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                keyboardOptions      = KeyboardOptions(keyboardType = KeyboardType.Password),
                errorMessage = if (password.isNotBlank() && password.length < 8) "Minimal 8 karakter" else null,
                isError              = password.isNotBlank() && password.length < 8
            )

            Spacer(Modifier.height(16.dp))

            // ── Konfirmasi Password ───────────────────────────────────────────
            val confirmError = if (confirmPassword.isNotBlank() && confirmPassword != password)
                "Kata sandi tidak cocok" else null

            AuthTextField(
                value                = confirmPassword,
                onValueChange        = { confirmPassword = it },
                label                = "Konfirmasi Kata Sandi",
                placeholder          = "••••••••",
                isError              = confirmError != null,
                errorMessage = confirmError,
                leadingIcon          = {
                    Icon(Icons.Outlined.Lock, null, tint = if (confirmError != null) MaterialTheme.colorScheme.error else AppColors.Muted, modifier = Modifier.size(20.dp))
                },
                trailingIcon = {
                    IconButton(onClick = { confirmPassVisible = !confirmPassVisible }) {
                        Icon(
                            imageVector = if (confirmPassVisible) Icons.Outlined.Visibility else Icons.Outlined.VisibilityOff,
                            contentDescription = null,
                            tint     = AppColors.Muted,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                },
                visualTransformation = if (confirmPassVisible) VisualTransformation.None else PasswordVisualTransformation(),
                keyboardOptions      = KeyboardOptions(keyboardType = KeyboardType.Password)
            )

            Spacer(Modifier.height(28.dp))

            // ── Tombol Daftar ─────────────────────────────────────────────────
            val canSubmit = !uiState.isLoading
                    && namaLengkap.isNotBlank()
                    && emailError == null && email.isNotBlank()
                    && password.length >= 8
                    && confirmError == null && confirmPassword.isNotBlank()

            Button(
                onClick  = { viewModel.register(namaLengkap, email, password, confirmPassword) },
                enabled  = canSubmit,
                modifier = Modifier.fillMaxWidth().height(52.dp),
                shape    = RoundedCornerShape(12.dp),
                colors   = ButtonDefaults.buttonColors(containerColor = AppColors.Forest)
            ) {
                if (uiState.isLoading) {
                    CircularProgressIndicator(modifier = Modifier.size(22.dp), color = Color.White, strokeWidth = 2.dp)
                } else {
                    Text(
                        text  = "Daftar",
                        style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.SemiBold, color = Color.White)
                    )
                }
            }

            Spacer(Modifier.height(20.dp))

            AuthDivider(label = "ATAU")

            Spacer(Modifier.height(20.dp))

            OutlinedButton(
                onClick  = { viewModel.startGoogleRegister() },
                enabled  = !uiState.isLoading && !uiState.isGoogleLoading,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape  = RoundedCornerShape(12.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, AppColors.Border),
                colors = ButtonDefaults.outlinedButtonColors(containerColor = Color.White)
            ) {
                if (uiState.isGoogleLoading) {
                    CircularProgressIndicator(
                        modifier    = Modifier.size(22.dp),
                        color       = Color(0xFF4285F4),
                        strokeWidth = 2.dp
                    )
                } else {
                    Text("G", fontWeight = FontWeight.Bold, color = Color(0xFF4285F4))
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text  = "Daftar dengan Google",
                        style = MaterialTheme.typography.bodyMedium.copy(color = AppColors.TextPrimary)
                    )
                }
            }

            Spacer(Modifier.height(28.dp))

            val loginText = buildAnnotatedString {
                append("Sudah punya akun? ")
                withStyle(SpanStyle(color = AppColors.Forest, fontWeight = FontWeight.SemiBold)) { append("Masuk di sini") }
            }
            Text(
                text     = loginText,
                style    = MaterialTheme.typography.bodyMedium.copy(color = AppColors.TextPrimary),
                modifier = Modifier.clickable { navController.popBackStack() }
            )

            Spacer(Modifier.height(32.dp))
        }
    }
}

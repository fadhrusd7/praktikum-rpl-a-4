package com.lestari.mobile.ui.screen.auth

import androidx.compose.foundation.BorderStroke
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
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.lestari.mobile.ui.theme.AppColors
import com.lestari.mobile.ui.viewmodel.AuthViewModel
import com.lestari.mobile.ui.viewmodel.AuthViewModelFactory
import com.lestari.mobile.ui.component.AuthTextField
import com.lestari.mobile.ui.component.AuthDivider
import com.lestari.mobile.ui.component.GoogleAuthWebView
import com.lestari.mobile.R
import com.lestari.mobile.ui.theme.Poppins

@Composable
fun LoginScreen(
    navController: NavController,
    onNavigateToForgotPassword: () -> Unit = {}
) {
    val context = LocalContext.current

    val viewModel: AuthViewModel = viewModel(
        factory = AuthViewModelFactory(context)
    )
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    var email by remember { mutableStateOf("") }
    var password        by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(uiState.loginSuccess) {
        if (uiState.loginSuccess) {
            navController.navigate(AuthRoutes.MAIN) {
                popUpTo(AuthRoutes.LOGIN) { inclusive = true }
            }
            viewModel.resetState()
        }
    }

    LaunchedEffect(uiState.errorMessage) {
        uiState.errorMessage?.let { msg ->
            snackbarHostState.showSnackbar(
                message  = msg,
                duration = SnackbarDuration.Short
            )
            viewModel.clearError()
        }
    }

    // ── Google Sign-In: WebView modal ─────────────────────────────────────────
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

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { innerPadding ->

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(AppColors.Page)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(60.dp))

            Image(
                painter = painterResource(id = R.drawable.logo_lestari),
                contentDescription = "Logo Lestari",
                modifier = Modifier
                    .size(64.dp)
                    .align(Alignment.CenterHorizontally),
            )

            Text(
                text  = "Lestari",
                fontFamily = Poppins,
                fontWeight = FontWeight.Bold,
                fontSize = 32.sp,
                color = Color(0xFF17682F)
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text  = "Selamat datang kembali",
                style = MaterialTheme.typography.bodyMedium.copy(color = AppColors.TextPrimary)
            )

            Spacer(modifier = Modifier.height(36.dp))

            AuthTextField(
                value         = email,
                onValueChange = { email = it },
                label         = "Email",
                placeholder   = "contoh@gmail.com",
                leadingIcon   = {
                    Icon(
                        imageVector     = Icons.Outlined.Email,
                        contentDescription = null,
                        tint            = AppColors.Muted,
                        modifier        = Modifier.size(20.dp)
                    )
                },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
            )

            Spacer(modifier = Modifier.height(16.dp))

            AuthTextField(
                value         = password,
                onValueChange = { password = it },
                label         = "Kata Sandi",
                placeholder   = "••••••••",
                leadingIcon   = {
                    Icon(
                        imageVector        = Icons.Outlined.Lock,
                        contentDescription = null,
                        tint               = AppColors.Muted,
                        modifier           = Modifier.size(20.dp)
                    )
                },
                trailingIcon = {
                    IconButton(onClick = { passwordVisible = !passwordVisible }) {
                        Icon(
                            imageVector = if (passwordVisible)
                                Icons.Outlined.Visibility
                            else
                                Icons.Outlined.VisibilityOff,
                            contentDescription = if (passwordVisible)
                                "Sembunyikan sandi" else "Tampilkan sandi",
                            tint     = AppColors.Muted,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                },
                visualTransformation = if (passwordVisible)
                    VisualTransformation.None else PasswordVisualTransformation(),
                keyboardOptions      = KeyboardOptions(keyboardType = KeyboardType.Password),
                labelTrailingContent = {
                    Text(
                        text     = "Lupa Kata Sandi?",
                        style    = MaterialTheme.typography.labelMedium.copy(
                            color      = AppColors.Forest,
                            fontWeight = FontWeight.SemiBold
                        ),
                        modifier = Modifier.clickable { onNavigateToForgotPassword() }
                    )
                }
            )

            Spacer(modifier = Modifier.height(28.dp))

            Button(
                onClick  = { viewModel.login(email, password) },
                enabled  = !uiState.isLoading && !uiState.isGoogleLoading,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape  = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = AppColors.Forest)
            ) {
                if (uiState.isLoading) {
                    CircularProgressIndicator(
                        modifier    = Modifier.size(22.dp),
                        color       = Color.White,
                        strokeWidth = 2.dp
                    )
                } else {
                    Text(
                        text  = "Masuk",
                        style = MaterialTheme.typography.bodyLarge.copy(
                            fontWeight = FontWeight.SemiBold,
                            color      = Color.White
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            AuthDivider(label = "ATAU")

            Spacer(modifier = Modifier.height(20.dp))

            OutlinedButton(
                onClick  = { viewModel.startGoogleLogin() },
                enabled  = !uiState.isLoading && !uiState.isGoogleLoading,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape  = RoundedCornerShape(12.dp),
                border = BorderStroke(1.dp, AppColors.Border),
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
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text  = "Masuk dengan Google",
                        style = MaterialTheme.typography.bodyMedium.copy(
                            color = AppColors.TextPrimary
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            val registerText = buildAnnotatedString {
                append("Belum punya akun? ")
                withStyle(SpanStyle(color = AppColors.Forest, fontWeight = FontWeight.SemiBold)) {
                    append("Daftar di sini")
                }
            }
            Text(
                text     = registerText,
                style    = MaterialTheme.typography.bodyMedium.copy(color = AppColors.TextPrimary),
                modifier = Modifier.clickable {
                    navController.navigate(AuthRoutes.REGISTER)
                }
            )

            Spacer(modifier = Modifier.height(32.dp))

            Row(
                horizontalArrangement = Arrangement.Center,
                modifier              = Modifier.fillMaxWidth()
            ) {
                Text(
                    text     = "Kebijakan Privasi",
                    style    = MaterialTheme.typography.bodySmall.copy(color = AppColors.Muted),
                    modifier = Modifier.clickable { }
                )
                Spacer(modifier = Modifier.width(24.dp))
                Text(
                    text     = "Bantuan",
                    style    = MaterialTheme.typography.bodySmall.copy(color = AppColors.Muted),
                    modifier = Modifier.clickable { }
                )
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
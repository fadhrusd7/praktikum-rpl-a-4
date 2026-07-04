package com.lestari.mobile.ui.screen.auth

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
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.lestari.mobile.ui.theme.AppColors
import com.lestari.mobile.ui.theme.MobileTheme
import com.lestari.mobile.ui.component.*
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.lestari.mobile.ui.viewmodel.AuthViewModel
import com.lestari.mobile.ui.viewmodel.AuthViewModelFactory

@Composable
fun ForgotPasswordScreen(
    onSendOtp: (email: String) -> Unit = {},
    onContactSupport: () -> Unit = {}
) {
    val context = LocalContext.current
    val viewModel: AuthViewModel = viewModel(factory = AuthViewModelFactory(context))
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    var email by remember { mutableStateOf("") }
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(uiState.forgotPasswordSuccess) {
        if (uiState.forgotPasswordSuccess) {
            onSendOtp(email)
            viewModel.resetState()
        }
    }

    LaunchedEffect(uiState.errorMessage) {
        uiState.errorMessage?.let { msg ->
            snackbarHostState.showSnackbar(message = msg, duration = SnackbarDuration.Short)
            viewModel.clearError()
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
        Spacer(modifier = Modifier.height(150.dp))

        AuthIllustrationIcon(imageVector = Icons.Outlined.Lock)

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = "Lupa Kata Sandi?",
            style = MaterialTheme.typography.headlineSmall.copy(
                fontWeight = FontWeight.Bold,
                color = AppColors.TextPrimary
            ),
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "Masukkan email terdaftar Anda untuk\nmenerima kode verifikasi",
            style = MaterialTheme.typography.bodyMedium.copy(color = AppColors.Muted),
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(32.dp))

        AuthTextField(
            value = email,
            onValueChange = { email = it },
            label = "Email",
            placeholder = "contoh@gmail.com",
            leadingIcon = {
                Icon(
                    imageVector = Icons.Outlined.Email,
                    contentDescription = null,
                    tint = AppColors.Muted,
                    modifier = Modifier.size(20.dp)
                )
            },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
        )

        Spacer(modifier = Modifier.height(28.dp))

        Button(
            onClick = { viewModel.forgotPassword(email) },
            enabled = !uiState.isLoading,
            modifier = Modifier.fillMaxWidth().height(52.dp),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(containerColor = AppColors.Forest)
        ) {
            if (uiState.isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(22.dp),
                    color = Color.White,
                    strokeWidth = 2.dp
                )
            } else {
                Text(
                    text = "Kirim Kode OTP",
                    style = MaterialTheme.typography.bodyLarge.copy(
                        fontWeight = FontWeight.SemiBold,
                        color = Color.White
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        val supportText = buildAnnotatedString {
            append("Punya masalah lain? ")
            withStyle(SpanStyle(color = AppColors.Forest, fontWeight = FontWeight.SemiBold)) {
                append("Hubungi Bantuan")
            }
        }
        Text(
            text = supportText,
            style = MaterialTheme.typography.bodySmall.copy(color = AppColors.TextPrimary),
            modifier = Modifier.clickable { onContactSupport() }
        )
    }
    }
}

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun ForgotPasswordPreview() {
    MobileTheme { ForgotPasswordScreen() }
}
package com.lestari.mobile.ui.screen.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.Visibility
import androidx.compose.material.icons.outlined.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
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
fun ResetPasswordScreen(
    targetEmail: String,
    resetToken: String,
    onSavePasswordSuccess: () -> Unit = {},
    onContactSupport: () -> Unit = {}
) {
    val context = LocalContext.current
    val viewModel: AuthViewModel = viewModel(factory = AuthViewModelFactory(context))
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    var newPassword by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var newPasswordVisible by remember { mutableStateOf(false) }
    var confirmPasswordVisible by remember { mutableStateOf(false) }
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(uiState.resetPasswordSuccess) {
        if (uiState.resetPasswordSuccess) {
            onSavePasswordSuccess()
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
        Spacer(modifier = Modifier.height(72.dp))

        AuthIllustrationIcon(imageVector = Icons.Outlined.Lock)

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = "Atur Kata Sandi Baru",
            style = MaterialTheme.typography.headlineSmall.copy(
                fontWeight = FontWeight.Bold,
                color = AppColors.TextPrimary
            ),
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "Demi keamanan akun Lestari Anda,\npilihlan kata sandi yang kuat",
            style = MaterialTheme.typography.bodyMedium.copy(color = AppColors.Muted),
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(32.dp))

        AuthTextField(
            value = newPassword,
            onValueChange = { newPassword = it },
            label = "Kata Sandi Baru",
            placeholder = "Minimal 8 karakter",
            leadingIcon = {
                Icon(Icons.Outlined.Lock, contentDescription = null, tint = AppColors.Muted, modifier = Modifier.size(20.dp))
            },
            trailingIcon = {
                IconButton(onClick = { newPasswordVisible = !newPasswordVisible }) {
                    Icon(
                        imageVector = if (newPasswordVisible) Icons.Outlined.Visibility else Icons.Outlined.VisibilityOff,
                        contentDescription = null,
                        tint = AppColors.Muted,
                        modifier = Modifier.size(20.dp)
                    )
                }
            },
            visualTransformation = if (newPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
        )

        Spacer(modifier = Modifier.height(16.dp))

        AuthTextField(
            value = confirmPassword,
            onValueChange = { confirmPassword = it },
            label = "Konfirmasi Kata Sandi Baru",
            placeholder = "Ulang Kata Sandi Baru",
            leadingIcon = {
                Icon(Icons.Outlined.Lock, contentDescription = null, tint = AppColors.Muted, modifier = Modifier.size(20.dp))
            },
            trailingIcon = {
                IconButton(onClick = { confirmPasswordVisible = !confirmPasswordVisible }) {
                    Icon(
                        imageVector = if (confirmPasswordVisible) Icons.Outlined.Visibility else Icons.Outlined.VisibilityOff,
                        contentDescription = null,
                        tint = AppColors.Muted,
                        modifier = Modifier.size(20.dp)
                    )
                }
            },
            visualTransformation = if (confirmPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
            isError = confirmPassword.isNotEmpty() && newPassword != confirmPassword,
            errorMessage = "Kata sandi tidak cocok"
        )

        Spacer(modifier = Modifier.height(28.dp))

        Button(
            onClick = { viewModel.resetPassword(targetEmail, resetToken, newPassword, confirmPassword) },
            modifier = Modifier.fillMaxWidth().height(52.dp),
            enabled = newPassword.length >= 8 && newPassword == confirmPassword && !uiState.isLoading,
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = AppColors.Forest,
                disabledContainerColor = AppColors.Forest.copy(alpha = 0.4f)
            )
        ) {
            if (uiState.isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(22.dp),
                    color = Color.White,
                    strokeWidth = 2.dp
                )
            } else {
                Text(
                    text = "Simpan Kata Sandi",
                    style = MaterialTheme.typography.bodyLarge.copy(
                        fontWeight = FontWeight.SemiBold,
                        color = Color.White
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        val supportText = buildAnnotatedString {
            append("Punya kendala? ")
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
private fun ResetPasswordPreview() {
    MobileTheme {
        ResetPasswordScreen(
            targetEmail = "contoh@gmail.com",
            resetToken = "token_reset_dummy"
        )
    }
}
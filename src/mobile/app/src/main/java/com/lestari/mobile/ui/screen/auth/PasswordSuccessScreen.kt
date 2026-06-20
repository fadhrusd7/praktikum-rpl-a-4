package com.lestari.mobile.ui.screen.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.lestari.mobile.ui.theme.AppColors
import com.lestari.mobile.ui.theme.MobileTheme
import com.lestari.mobile.ui.component.*

@Composable
fun PasswordSuccessScreen(
    onBackToLogin: () -> Unit = {},
    onContactSupport: () -> Unit = {}
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(AppColors.Page)
            .padding(horizontal = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {

        Icon(
            imageVector = Icons.Filled.CheckCircle,
            contentDescription = "Sukses",
            tint = AppColors.Forest,
            modifier = Modifier
                .size(80.dp)
                .align(Alignment.CenterHorizontally),
        )

        Spacer(modifier = Modifier.height(28.dp))

        Text(
            text = "Kata Sandi Berhasil\nDiperbarui",
            style = MaterialTheme.typography.headlineSmall.copy(
                fontWeight = FontWeight.Bold,
                color = AppColors.TextPrimary
            ),
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(12.dp))

        Text(
            text = "Sekarang Anda dapat masuk kembali ke\nakun Anda dengan kata sandi baru",
            style = MaterialTheme.typography.bodyMedium.copy(color = AppColors.Muted),
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(36.dp))

        Button(
            onClick = { onBackToLogin() },
            modifier = Modifier.fillMaxWidth().height(52.dp),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(containerColor = AppColors.Forest)
        ) {
            Text(
                text = "Kembali ke Login",
                style = MaterialTheme.typography.bodyLarge.copy(
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White
                )
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        val supportText = buildAnnotatedString {
            append("Punya kendala? ")
            withStyle(SpanStyle(color = AppColors.Forest, fontWeight = FontWeight.SemiBold)) {
                append("Hubungi Bantuan")
            }
        }
        Text(
            text = supportText,
            style = MaterialTheme.typography.bodySmall,
            modifier = Modifier.clickable { onContactSupport() }
        )
    }
}

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun PasswordSuccessPreview() {
    MobileTheme { PasswordSuccessScreen() }
}
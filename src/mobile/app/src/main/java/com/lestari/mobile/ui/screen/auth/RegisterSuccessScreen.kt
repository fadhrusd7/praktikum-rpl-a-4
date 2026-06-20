package com.lestari.mobile.ui.screen.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.lestari.mobile.ui.theme.AppColors
import com.lestari.mobile.ui.theme.Poppins

@Composable
fun RegisterSuccessScreen(
    isLoggedIn: Boolean = false,
    onContinue: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(AppColors.Page)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = Icons.Filled.CheckCircle,
            contentDescription = null,
            tint = AppColors.Forest,
            modifier = Modifier.size(100.dp)
        )
        
        Spacer(modifier = Modifier.height(32.dp))
        
        Text(
            text = if (isLoggedIn) "Selamat Datang!" else "Registrasi Berhasil!",
            fontFamily = Poppins,
            fontWeight = FontWeight.Bold,
            fontSize = 24.sp,
            color = AppColors.TextPrimary
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = if (isLoggedIn)
                "Akun Anda telah berhasil terhubung. Mulailah berkontribusi untuk lingkungan yang lebih hijau bersama Lestari."
            else
                "Akun Anda telah berhasil dibuat. Silakan masuk untuk mulai menggunakan layanan Lestari.",
            fontFamily = Poppins,
            textAlign = TextAlign.Center,
            color = AppColors.Muted,
            fontSize = 14.sp,
            lineHeight = 20.sp
        )
        
        Spacer(modifier = Modifier.height(48.dp))
        
        Button(
            onClick = onContinue,
            modifier = Modifier.fillMaxWidth().height(52.dp),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(containerColor = AppColors.Forest)
        ) {
            Text(
                text = if (isLoggedIn) "Mulai Sekarang" else "Masuk Sekarang",
                fontFamily = Poppins,
                fontWeight = FontWeight.SemiBold,
                color = Color.White,
                fontSize = 16.sp
            )
        }
    }
}

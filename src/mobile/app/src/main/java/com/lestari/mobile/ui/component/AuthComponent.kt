package com.lestari.mobile.ui.component

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.text.selection.TextSelectionColors
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.lestari.mobile.ui.theme.AppColors

/**
 * TextField standar untuk semua form auth.
 *
 * [labelTrailingContent] dipakai untuk menaruh link "Lupa Kata Sandi?"
 * sejajar dengan label field.
 */
@Composable
fun AuthTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    placeholder: String,
    modifier: Modifier = Modifier,
    leadingIcon: @Composable (() -> Unit)? = null,
    trailingIcon: @Composable (() -> Unit)? = null,
    labelTrailingContent: @Composable (() -> Unit)? = null,
    visualTransformation: VisualTransformation = VisualTransformation.None,
    keyboardOptions: KeyboardOptions = KeyboardOptions.Default,
    isError: Boolean = false,
    errorMessage: String? = null
) {
    Column(modifier = modifier.fillMaxWidth()) {
        // Baris label (+ link opsional di kanan)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = label,
                style = MaterialTheme.typography.labelLarge.copy(
                    color = AppColors.TextPrimary,
                    fontWeight = FontWeight.SemiBold
                )
            )
            labelTrailingContent?.invoke()
        }

        Spacer(modifier = Modifier.height(6.dp))

        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.fillMaxWidth(),
            textStyle = LocalTextStyle.current.copy(color = AppColors.TextPrimary),
            placeholder = {
                Text(
                    text = placeholder,
                    style = MaterialTheme.typography.bodyMedium.copy(color = AppColors.Muted)
                )
            },
            leadingIcon = leadingIcon,
            trailingIcon = trailingIcon,
            visualTransformation = visualTransformation,
            keyboardOptions = keyboardOptions,
            isError = isError,
            singleLine = true,
            shape = RoundedCornerShape(10.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = AppColors.TextPrimary,
                unfocusedTextColor = AppColors.TextPrimary,
                errorTextColor = AppColors.TextPrimary,
                focusedBorderColor = AppColors.Forest,
                unfocusedBorderColor = AppColors.Border,
                errorBorderColor = AppColors.Danger,
                focusedContainerColor = Color.White,
                unfocusedContainerColor = Color.White,
                errorContainerColor = Color.White,
                cursorColor = AppColors.Forest,
                selectionColors = TextSelectionColors(
                    handleColor = AppColors.Forest,
                    backgroundColor = AppColors.Forest.copy(alpha = 0.2f)
                )
            )
        )

        // Pesan error
        if (isError && errorMessage != null) {
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = errorMessage,
                style = MaterialTheme.typography.bodySmall.copy(color = AppColors.Danger)
            )
        }
    }
}

/**
 * Divider "——— ATAU ———" yang dipakai di Login dan Register screen.
 */
@Composable
fun AuthDivider(label: String = "ATAU") {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        HorizontalDivider(
            modifier = Modifier.weight(1f),
            color = AppColors.Border
        )
        Text(
            text = label,
            modifier = Modifier.padding(horizontal = 16.dp),
            style = MaterialTheme.typography.bodySmall.copy(color = AppColors.Muted)
        )
        HorizontalDivider(
            modifier = Modifier.weight(1f),
            color = AppColors.Border
        )
    }
}

/**
 * Ikon ilustrasi yang dipakai di halaman ForgotPassword, OTP, dll.
 * Sementara menggunakan Box berwarna; ganti dengan Image saat aset siap.
 */
@Composable
fun AuthIllustrationIcon(
    imageVector: ImageVector,
    modifier: Modifier = Modifier,
    tint: Color = AppColors.Forest
) {
    Box(
        modifier = modifier
            .size(80.dp)
            .background(
                color = tint.copy(alpha = 0.08f),
                shape = RoundedCornerShape(24.dp)
            ),
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = imageVector,
            contentDescription = null,
            modifier = Modifier.size(40.dp),
            tint = tint
        )
    }
}
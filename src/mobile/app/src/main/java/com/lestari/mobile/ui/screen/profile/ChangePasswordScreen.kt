package com.lestari.mobile.ui.screen.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusDirection
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.lestari.mobile.ui.theme.AppColors
import com.lestari.mobile.ui.viewmodel.ChangePasswordEvent
import com.lestari.mobile.ui.viewmodel.ChangePasswordSaveState
import com.lestari.mobile.ui.viewmodel.ChangePasswordViewModel
import com.lestari.mobile.ui.viewmodel.DeleteAccountState
import kotlinx.coroutines.flow.collectLatest

// ─── Warna zona bahaya ────────────────────────────────────────────────────────
private val DangerBg     = Color(0xFFFFF0F0)
private val DangerBorder = Color(0xFFFFCDD2)
private val DangerText   = Color(0xFFB71C1C)
private val DangerIcon   = Color(0xFFE53935)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChangePasswordScreen(
    onNavigateBack: () -> Unit,
    onAccountDeleted: () -> Unit,       // ← navigasi ke Login setelah akun dihapus
    viewModel: ChangePasswordViewModel,
) {
    val form              by viewModel.form.collectAsState()
    val saveState         by viewModel.saveState.collectAsState()
    val deleteAccountState by viewModel.deleteAccountState.collectAsState()

    val snackbarHostState = remember { SnackbarHostState() }
    val focusManager      = LocalFocusManager.current

    // ── Dialog visibility ─────────────────────────────────────────────────────
    var showConfirmDialog by remember { mutableStateOf(false) }

    // ── One-shot event listener ───────────────────────────────────────────────
    LaunchedEffect(Unit) {
        viewModel.events.collectLatest { event ->
            when (event) {
                is ChangePasswordEvent.ShowSnackbar ->
                    snackbarHostState.showSnackbar(
                        message  = event.message,
                        duration = SnackbarDuration.Short,
                    )
                is ChangePasswordEvent.NavigateBack -> onNavigateBack()
            }
        }
    }

    // ── Handle deleteAccountState ─────────────────────────────────────────────
    LaunchedEffect(deleteAccountState) {
        when (val state = deleteAccountState) {
            is DeleteAccountState.Success -> {
                // Sesi sudah dibersihkan di ViewModel — langsung ke Login
                onAccountDeleted()
            }
            is DeleteAccountState.Error -> {
                showConfirmDialog = false
                snackbarHostState.showSnackbar(
                    message  = state.message,
                    duration = SnackbarDuration.Long,
                )
                viewModel.resetDeleteAccountState()
            }
            else -> Unit
        }
    }

    val isSaving         = saveState is ChangePasswordSaveState.Saving
    val isDeletingAccount = deleteAccountState is DeleteAccountState.Loading

    // ── Konfirmasi Dialog ─────────────────────────────────────────────────────
    if (showConfirmDialog) {
        DeleteAccountConfirmDialog(
            isDeleting = isDeletingAccount,
            onConfirm  = { password -> viewModel.deleteAccount(password) },
            onDismiss  = {
                if (!isDeletingAccount) {
                    showConfirmDialog = false
                    viewModel.resetDeleteAccountState()
                }
            },
        )
    }

    Scaffold(
        snackbarHost   = { SnackbarHost(snackbarHostState) },
        containerColor = Color(0xFFF2F4F3),
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "Privasi & Keamanan",
                        fontWeight = FontWeight.Bold,
                        fontSize   = 18.sp,
                        color      = AppColors.ForestDark,
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector        = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Kembali",
                            tint               = AppColors.ForestDark,
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFFF2F4F3),
                ),
            )
        },
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 16.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {

            // ── Kartu Ganti Sandi ─────────────────────────────────────────────
            Card(
                modifier  = Modifier.fillMaxWidth(),
                shape     = RoundedCornerShape(16.dp),
                colors    = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                ) {
                    Text(
                        text       = "Ganti Sandi",
                        fontWeight = FontWeight.Bold,
                        fontSize   = 16.sp,
                        color      = Color(0xFF1A1A1A),
                    )
                    Text(
                        text     = "Pastikan menggunakan sandi yang kuat dan unik.",
                        fontSize = 13.sp,
                        color    = Color.Gray,
                    )

                    HorizontalDivider(color = Color(0xFFEEEEEE))

                    PasswordField(
                        label         = "Sandi Lama",
                        placeholder   = "Masukkan sandi lama Anda",
                        value         = form.passwordLama,
                        onValueChange = viewModel::onPasswordLamaChange,
                        errorMessage  = form.passwordLamaError,
                        enabled       = !isSaving,
                        imeAction     = ImeAction.Next,
                        onImeAction   = { focusManager.moveFocus(FocusDirection.Down) },
                    )

                    PasswordField(
                        label         = "Sandi Baru",
                        placeholder   = "Min. 8 karakter",
                        value         = form.passwordBaru,
                        onValueChange = viewModel::onPasswordBaruChange,
                        errorMessage  = form.passwordBaruError,
                        enabled       = !isSaving,
                        imeAction     = ImeAction.Next,
                        onImeAction   = { focusManager.moveFocus(FocusDirection.Down) },
                    )

                    PasswordField(
                        label         = "Konfirmasi Sandi Baru",
                        placeholder   = "Ulangi sandi baru",
                        value         = form.konfirmasiPasswordBaru,
                        onValueChange = viewModel::onKonfirmasiPasswordBaruChange,
                        errorMessage  = form.konfirmasiPasswordBaruError,
                        enabled       = !isSaving,
                        imeAction     = ImeAction.Done,
                        onImeAction   = {
                            focusManager.clearFocus()
                            viewModel.submitChangePassword()
                        },
                    )

                    Button(
                        onClick  = {
                            focusManager.clearFocus()
                            viewModel.submitChangePassword()
                        },
                        enabled  = !isSaving,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp),
                        shape  = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor         = AppColors.ForestDark,
                            contentColor           = Color.White,
                            disabledContainerColor = AppColors.ForestDark.copy(alpha = 0.5f),
                            disabledContentColor   = Color.White.copy(alpha = 0.7f),
                        ),
                    ) {
                        if (isSaving) {
                            CircularProgressIndicator(
                                modifier    = Modifier.size(20.dp),
                                color       = Color.White,
                                strokeWidth = 2.dp,
                            )
                            Spacer(Modifier.width(8.dp))
                            Text("Menyimpan...", fontWeight = FontWeight.SemiBold)
                        } else {
                            Text("Ubah Password", fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }

            // ── Kartu Zona Bahaya ─────────────────────────────────────────────
            Card(
                modifier  = Modifier.fillMaxWidth(),
                shape     = RoundedCornerShape(16.dp),
                colors    = CardDefaults.cardColors(containerColor = DangerBg),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
                border    = androidx.compose.foundation.BorderStroke(1.dp, DangerBorder),
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    Row(
                        verticalAlignment      = Alignment.CenterVertically,
                        horizontalArrangement  = Arrangement.spacedBy(8.dp),
                    ) {
                        Icon(
                            imageVector        = Icons.Default.Lock,
                            contentDescription = null,
                            tint               = DangerIcon,
                            modifier           = Modifier.size(20.dp),
                        )
                        Text(
                            text       = "Zona Bahaya",
                            fontWeight = FontWeight.Bold,
                            fontSize   = 15.sp,
                            color      = DangerText,
                        )
                    }
                    Text(
                        text       = "Menghapus akun akan menghapus semua data laporan Anda beserta semua komentar terkait laporan. Tindakan ini tidak dapat dibatalkan.",
                        fontSize   = 13.sp,
                        color      = DangerText.copy(alpha = 0.85f),
                        lineHeight = 18.sp,
                    )
                    Spacer(Modifier.height(4.dp))
                    OutlinedButton(
                        onClick  = { showConfirmDialog = true },
                        enabled  = !isDeletingAccount,
                        shape    = RoundedCornerShape(8.dp),
                        colors   = ButtonDefaults.outlinedButtonColors(contentColor = DangerText),
                        border   = androidx.compose.foundation.BorderStroke(
                            1.dp,
                            if (isDeletingAccount) DangerText.copy(alpha = 0.4f) else DangerText
                        ),
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        if (isDeletingAccount) {
                            CircularProgressIndicator(
                                modifier    = Modifier.size(16.dp),
                                color       = DangerText,
                                strokeWidth = 2.dp,
                            )
                            Spacer(Modifier.width(8.dp))
                            Text(
                                "Menghapus...",
                                fontWeight = FontWeight.Medium,
                                color      = DangerText.copy(alpha = 0.6f),
                            )
                        } else {
                            Text(
                                "Hapus Akun Saya",
                                fontWeight = FontWeight.Medium,
                                color      = DangerText,
                            )
                        }
                    }
                }
            }

            Spacer(Modifier.height(24.dp))
        }
    }
}

// ─── Dialog Konfirmasi Hapus Akun ─────────────────────────────────────────────
@Composable
private fun DeleteAccountConfirmDialog(
    isDeleting: Boolean,
    onConfirm:  (String) -> Unit,
    onDismiss:  () -> Unit,
) {
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }

    Dialog(
        onDismissRequest = onDismiss,
        properties       = DialogProperties(
            dismissOnBackPress      = !isDeleting,
            dismissOnClickOutside   = !isDeleting,
        ),
    ) {
        Card(
            shape     = RoundedCornerShape(20.dp),
            colors    = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
        ) {
            Column(
                modifier            = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                // Ikon peringatan
                Box(
                    modifier            = Modifier
                        .size(56.dp)
                        .background(Color(0xFFFFF0F0), shape = RoundedCornerShape(28.dp)),
                    contentAlignment    = Alignment.Center,
                ) {
                    Icon(
                        imageVector        = Icons.Default.Warning,
                        contentDescription = null,
                        tint               = Color(0xFFE53935),
                        modifier           = Modifier.size(28.dp),
                    )
                }

                // Judul
                Text(
                    text       = "Hapus Akun?",
                    fontWeight = FontWeight.Bold,
                    fontSize   = 18.sp,
                    color      = Color(0xFF1A1A1A),
                    textAlign  = TextAlign.Center,
                )

                // Deskripsi
                Text(
                    text      = "Silakan masukkan kata sandi Anda untuk mengonfirmasi penghapusan akun permanen.",
                    fontSize  = 14.sp,
                    color     = Color(0xFF555555),
                    textAlign = TextAlign.Center,
                    lineHeight = 20.sp,
                )

                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text("Kata Sandi", color = Color(0xFF444444)) },
                    placeholder = { 
                        Text("Masukkan kata sandi Anda", color = Color(0xFF999999), fontSize = 14.sp) 
                    },
                    singleLine = true,
                    enabled = !isDeleting,
                    modifier = Modifier.fillMaxWidth(),
                    textStyle = TextStyle(color = Color.Black, fontSize = 14.sp),
                    visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    trailingIcon = {
                        IconButton(onClick = { passwordVisible = !passwordVisible }) {
                            Icon(
                                imageVector = if (passwordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                contentDescription = if (passwordVisible) "Sembunyikan sandi" else "Tampilkan sandi",
                                tint = Color.Gray
                            )
                        }
                    },
                    shape = RoundedCornerShape(10.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.Black,
                        unfocusedTextColor = Color.Black,
                        disabledTextColor = Color.Black.copy(alpha = 0.6f),
                        focusedBorderColor = AppColors.ForestDark,
                        unfocusedBorderColor = Color(0xFFBBBBBB),
                        focusedLabelColor = AppColors.ForestDark,
                        unfocusedLabelColor = Color(0xFF444444),
                        cursorColor = AppColors.ForestDark,
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White,
                        disabledContainerColor = Color.White,
                    )
                )

                HorizontalDivider(color = Color(0xFFEEEEEE))

                // Tombol
                Row(
                    modifier              = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    // Tombol Batal
                    OutlinedButton(
                        onClick  = onDismiss,
                        enabled  = !isDeleting,
                        modifier = Modifier.weight(1f).height(44.dp),
                        shape    = RoundedCornerShape(10.dp),
                        colors   = ButtonDefaults.outlinedButtonColors(
                            contentColor         = Color(0xFF555555),
                            disabledContentColor = Color(0xFF555555).copy(alpha = 0.4f),
                        ),
                    ) {
                        Text("Batal", fontWeight = FontWeight.Medium)
                    }

                    // Tombol Hapus Akun
                    Button(
                        onClick  = { onConfirm(password) },
                        enabled  = !isDeleting && password.isNotBlank(),
                        modifier = Modifier.weight(1f).height(44.dp),
                        shape    = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor         = Color(0xFFD32F2F),
                            contentColor           = Color.White,
                            disabledContainerColor = Color(0xFFD32F2F).copy(alpha = 0.5f),
                            disabledContentColor   = Color.White.copy(alpha = 0.7f),
                        ),
                    ) {
                        if (isDeleting) {
                            CircularProgressIndicator(
                                modifier    = Modifier.size(18.dp),
                                color       = Color.White,
                                strokeWidth = 2.dp,
                            )
                        } else {
                            Text("Hapus", fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }
        }
    }
}

// ─── Reusable Password Field ──────────────────────────────────────────────────
@Composable
private fun PasswordField(
    label:         String,
    placeholder:   String,
    value:         String,
    onValueChange: (String) -> Unit,
    errorMessage:  String?,
    enabled:       Boolean,
    imeAction:     ImeAction,
    onImeAction:   () -> Unit,
) {
    var visible by remember { mutableStateOf(false) }

    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(
            text       = label,
            fontSize   = 13.sp,
            fontWeight = FontWeight.Medium,
            color      = Color(0xFF444444),
        )
        OutlinedTextField(
            value               = value,
            onValueChange       = onValueChange,
            enabled             = enabled,
            placeholder         = {
                Text(placeholder, color = Color(0xFFAAAAAA), fontSize = 14.sp)
            },
            visualTransformation = if (visible) VisualTransformation.None
            else PasswordVisualTransformation(),
            trailingIcon = {
                IconButton(onClick = { visible = !visible }) {
                    Icon(
                        imageVector        = if (visible) Icons.Default.VisibilityOff
                        else Icons.Default.Visibility,
                        contentDescription = if (visible) "Sembunyikan sandi" else "Tampilkan sandi",
                        tint               = Color.Gray,
                    )
                }
            },
            isError         = errorMessage != null,
            supportingText  = if (errorMessage != null) {
                { Text(errorMessage, color = MaterialTheme.colorScheme.error, fontSize = 12.sp) }
            } else null,
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Password,
                imeAction    = imeAction,
            ),
            keyboardActions = KeyboardActions(
                onNext = { onImeAction() },
                onDone = { onImeAction() },
            ),
            singleLine      = true,
            shape           = RoundedCornerShape(10.dp),
            modifier        = Modifier.fillMaxWidth(),
            textStyle       = TextStyle(color = Color(0xFF1A1A1A), fontSize = 14.sp),
            colors          = OutlinedTextFieldDefaults.colors(
                focusedTextColor        = Color(0xFF1A1A1A),
                unfocusedTextColor      = Color(0xFF1A1A1A),
                focusedBorderColor      = AppColors.ForestDark,
                focusedLabelColor       = AppColors.ForestDark,
                cursorColor             = AppColors.ForestDark,
                unfocusedBorderColor    = Color(0xFFCCCCCC),
                focusedContainerColor   = Color.White,
                unfocusedContainerColor = Color.White,
            ),
        )
    }
}
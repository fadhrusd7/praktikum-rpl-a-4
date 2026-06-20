package com.lestari.mobile.ui.screen.profile

import android.net.Uri
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import coil.request.CachePolicy
import coil.request.ImageRequest
import com.lestari.mobile.ui.theme.AppColors
import com.lestari.mobile.data.api.RetrofitClient
import com.lestari.mobile.data.repository.UserRepository
import com.lestari.mobile.ui.viewmodel.EditProfileViewModel
import com.lestari.mobile.ui.component.AppHeader
import kotlinx.coroutines.flow.collectLatest

@Composable
fun EditProfileScreen(
    onNavigateBack: () -> Unit,
    userRepository: UserRepository,
    viewModel: EditProfileViewModel = viewModel(
        factory = EditProfileViewModel.Factory(userRepository)
    ),
) {
    val formState by viewModel.formState.collectAsStateWithLifecycle()
    val loadState by viewModel.loadState.collectAsStateWithLifecycle()
    val saveState by viewModel.saveState.collectAsStateWithLifecycle()

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(Unit) {
        viewModel.events.collectLatest { event ->
            when (event) {
                is EditProfileEvent.ShowSnackbar ->
                    snackbarHostState.showSnackbar(event.message)
                EditProfileEvent.NavigateBack ->
                    onNavigateBack()
            }
        }
    }

    Scaffold(
        snackbarHost   = { SnackbarHost(snackbarHostState) },
        containerColor = AppColors.Page,
        topBar = {
            AppHeader(
                title = "Edit Profil",
                backgroundColor = AppColors.Page,
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Kembali",
                            tint = AppColors.Forest
                        )
                    }
                }
            )
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(AppColors.Page)
        ) {
            when (loadState) {
                ProfileLoadState.Idle,
                ProfileLoadState.Loading -> {
                    CircularProgressIndicator(
                        color    = AppColors.Forest,
                        modifier = Modifier.align(Alignment.Center),
                    )
                }
                is ProfileLoadState.Error -> {
                    Column(
                        modifier            = Modifier.align(Alignment.Center).padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        Text(
                            text     = (loadState as ProfileLoadState.Error).message,
                            color    = AppColors.Muted,
                            fontSize = 14.sp,
                        )
                        Button(
                            onClick = viewModel::loadProfile,
                            colors  = ButtonDefaults.buttonColors(containerColor = AppColors.Forest),
                            shape   = RoundedCornerShape(8.dp),
                        ) {
                            Text("Coba Lagi", color = Color.White)
                        }
                    }
                }
                ProfileLoadState.Success -> {
                    EditProfileContent(
                        formState           = formState,
                        isSaving            = saveState is ProfileSaveState.Saving,
                        onNamaDepanChange   = viewModel::onNamaDepanChange,
                        onNamaBelakangChange = viewModel::onNamaBelakangChange,
                        onNoTeleponChange   = viewModel::onNoTeleponChange,
                        onKotaChange        = viewModel::onKotaChange,
                        onPhotoSelected     = viewModel::onPhotoSelected,
                        onSave              = viewModel::saveProfile,
                        onCancel            = onNavigateBack,
                    )
                }
            }
        }
    }
}

@Composable
private fun EditProfileContent(
    formState: EditProfileFormState,
    isSaving: Boolean,
    onNamaDepanChange: (String) -> Unit,
    onNamaBelakangChange: (String) -> Unit,
    onNoTeleponChange: (String) -> Unit,
    onKotaChange: (String) -> Unit,
    onPhotoSelected: (Uri?) -> Unit,
    onSave: () -> Unit,
    onCancel: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Spacer(Modifier.height(12.dp))

        ProfilePhotoSection(
            photoUrl         = formState.profilePhotoUrl,
            selectedPhotoUri = formState.selectedPhotoUri,
            onPhotoSelected  = onPhotoSelected,
        )

        Spacer(Modifier.height(28.dp))

        Column(
            modifier            = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            LestariTextField(
                label         = "Nama Depan",
                value         = formState.namaDepan,
                onValueChange = onNamaDepanChange,
                errorMessage  = formState.namaDepanError,
                keyboardOptions = KeyboardOptions(
                    capitalization = KeyboardCapitalization.Words,
                    imeAction      = ImeAction.Next,
                ),
            )

            LestariTextField(
                label         = "Nama Belakang",
                value         = formState.namaBelakang,
                onValueChange = onNamaBelakangChange,
                errorMessage  = formState.namaBelakangError,
                keyboardOptions = KeyboardOptions(
                    capitalization = KeyboardCapitalization.Words,
                    imeAction      = ImeAction.Next,
                ),
            )

            LestariTextField(
                label         = "Nomor Telepon",
                value         = formState.noTelepon,
                onValueChange = onNoTeleponChange,
                errorMessage  = formState.noTeleponError,
                placeholder   = "+62 8xxx xxxx xxxx",
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Phone,
                    imeAction    = ImeAction.Next,
                ),
            )

            LestariTextField(
                label         = "Email",
                value         = formState.email,
                onValueChange = {},
                readOnly      = true,
            )

            LestariTextField(
                label         = "Kota/Kecamatan",
                value         = formState.kota,
                onValueChange = onKotaChange,
                leadingIcon   = {
                    Icon(
                        imageVector        = Icons.Default.LocationOn,
                        contentDescription = null,
                        tint               = AppColors.Forest,
                        modifier           = Modifier.size(18.dp),
                    )
                },
                keyboardOptions = KeyboardOptions(
                    capitalization = KeyboardCapitalization.Words,
                    imeAction      = ImeAction.Done,
                ),
            )
        }

        Spacer(Modifier.height(32.dp))

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment     = Alignment.CenterVertically,
        ) {
            Button(
                onClick  = onSave,
                enabled  = !isSaving,
                colors   = ButtonDefaults.buttonColors(
                    containerColor         = AppColors.ForestDark,
                    contentColor           = Color.White,
                ),
                shape    = RoundedCornerShape(8.dp),
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp),
            ) {
                if (isSaving) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(18.dp), strokeWidth = 2.dp)
                } else {
                    Text("Simpan Perubahan", fontSize = 14.sp, fontWeight = FontWeight.Bold)
                }
            }

            TextButton(onClick = onCancel, enabled = !isSaving) {
                Text(text = "Batal", color = AppColors.Muted)
            }
        }

        Spacer(Modifier.height(40.dp))
    }
}

@Composable
private fun ProfilePhotoSection(
    photoUrl: String?,
    selectedPhotoUri: Uri?,
    onPhotoSelected: (Uri?) -> Unit,
) {
    val context = LocalContext.current
    val photoPicker = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri -> onPhotoSelected(uri) }

    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(contentAlignment = Alignment.BottomEnd) {
            val imageData: Any? = selectedPhotoUri ?: RetrofitClient.resolveProfilePhotoUrl(photoUrl)

            AsyncImage(
                model = ImageRequest.Builder(context)
                    .data(imageData ?: Icons.Default.Person)
                    .crossfade(true)
                    .diskCachePolicy(CachePolicy.DISABLED)
                    .memoryCachePolicy(CachePolicy.DISABLED)
                    .build(),
                contentDescription = "Foto profil",
                contentScale       = ContentScale.Crop,
                modifier           = Modifier
                    .size(100.dp)
                    .clip(CircleShape)
                    .background(AppColors.Border.copy(alpha = 0.2f))
                    .border(2.dp, AppColors.Forest.copy(alpha = 0.1f), CircleShape)
                    .clickable { photoPicker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) },
            )

            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(CircleShape)
                    .background(AppColors.Forest)
                    .border(2.dp, Color.White, CircleShape),
                contentAlignment = Alignment.Center,
            ) {
                Icon(Icons.Default.CameraAlt, null, tint = Color.White, modifier = Modifier.size(16.dp))
            }
        }
        Spacer(Modifier.height(12.dp))
        Text("Ubah Foto Profil", fontSize = 14.sp, color = AppColors.Forest, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
private fun LestariTextField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    errorMessage: String? = null,
    placeholder: String? = null,
    readOnly: Boolean = false,
    leadingIcon: (@Composable () -> Unit)? = null,
    keyboardOptions: KeyboardOptions = KeyboardOptions.Default,
) {
    Column(modifier = modifier.fillMaxWidth()) {
        Text(
            text       = label,
            fontSize   = 13.sp,
            color      = AppColors.Muted,
            fontWeight = FontWeight.SemiBold,
            modifier   = Modifier.padding(bottom = 6.dp),
        )
        OutlinedTextField(
            value           = value,
            onValueChange   = onValueChange,
            readOnly        = readOnly,
            singleLine      = true,
            isError         = errorMessage != null,
            placeholder     = placeholder?.let { { Text(it, color = AppColors.Border) } },
            leadingIcon     = leadingIcon,
            keyboardOptions = keyboardOptions,
            colors          = OutlinedTextFieldDefaults.colors(
                focusedTextColor        = AppColors.TextPrimary,
                unfocusedTextColor      = AppColors.TextPrimary,
                disabledTextColor       = AppColors.TextPrimary,
                focusedBorderColor      = AppColors.Forest,
                unfocusedBorderColor    = AppColors.Border,
                errorBorderColor        = AppColors.Danger,
                focusedContainerColor   = Color.White,
                unfocusedContainerColor = if (readOnly) AppColors.Border.copy(alpha = 0.1f) else Color.White,
                cursorColor             = AppColors.Forest,
            ),
            shape    = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth(),
        )
        if (errorMessage != null) {
            Text(errorMessage, color = AppColors.Danger, fontSize = 12.sp, modifier = Modifier.padding(top = 4.dp))
        }
    }
}

package com.lestari.mobile.ui.component

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.NotificationsNone
import androidx.compose.material.icons.outlined.ChevronRight
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.lestari.mobile.model.toReadableDate
import com.lestari.mobile.data.model.NotificationData
import com.lestari.mobile.ui.theme.AppColors
import com.lestari.mobile.ui.viewmodel.NotificationViewModel
import com.lestari.mobile.util.Resource

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationBottomSheet(
    viewModel: NotificationViewModel,
    onDismiss: () -> Unit,
    onReportClick: (Int) -> Unit
) {
    val notificationsState by viewModel.notifications.collectAsState()
    val unreadCount by viewModel.unreadCount.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.fetchNotifications()
    }

    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = false)

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = Color.White,
        shape = RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.75f)
                .padding(horizontal = 16.dp)
                .padding(bottom = 24.dp)
        ) {
            // ── Header Notifikasi ─────────────────────────────────────────────
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = "Notifikasi",
                        fontWeight = FontWeight.Bold,
                        fontSize = 20.sp,
                        color = AppColors.TextPrimary
                    )
                    Text(
                        text = "Riwayat aktivitas laporan Anda",
                        fontSize = 12.sp,
                        color = AppColors.Muted
                    )
                }

                if (unreadCount > 0) {
                    TextButton(
                        onClick = { viewModel.markAllAsRead() }
                    ) {
                        Text(
                            text = "Tandai Semua Dibaca",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = AppColors.Forest
                        )
                    }
                }
            }

            Spacer(Modifier.height(16.dp))
            HorizontalDivider(color = AppColors.Border.copy(alpha = 0.5f))
            Spacer(Modifier.height(8.dp))

            // ── Konten List Notifikasi ────────────────────────────────────────
            when (val state = notificationsState) {
                is Resource.Loading -> {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(color = AppColors.Forest)
                    }
                }
                is Resource.Error -> {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f)
                            .padding(16.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = state.message,
                                color = AppColors.Danger,
                                fontSize = 14.sp
                            )
                            Spacer(Modifier.height(8.dp))
                            Button(
                                onClick = { viewModel.fetchNotifications() },
                                colors = ButtonDefaults.buttonColors(containerColor = AppColors.Forest)
                            ) {
                                Text("Coba Lagi")
                            }
                        }
                    }
                }
                is Resource.Success -> {
                    val list = state.data ?: emptyList()
                    if (list.isEmpty()) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .weight(1f),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Icon(
                                    imageVector = Icons.Default.NotificationsNone,
                                    contentDescription = "Kosong",
                                    tint = AppColors.Muted.copy(alpha = 0.5f),
                                    modifier = Modifier.size(64.dp)
                                )
                                Spacer(Modifier.height(12.dp))
                                Text(
                                    text = "Belum ada notifikasi baru.",
                                    color = AppColors.Muted,
                                    fontSize = 14.sp
                                )
                            }
                        }
                    } else {
                        LazyColumn(
                            modifier = Modifier
                                .fillMaxWidth()
                                .weight(1f),
                            verticalArrangement = Arrangement.spacedBy(10.dp),
                            contentPadding = PaddingValues(vertical = 8.dp)
                        ) {
                            items(list) { item ->
                                NotificationRowItem(
                                    notification = item,
                                    onClick = {
                                        if (item.report_id != null) {
                                            onReportClick(item.report_id)
                                        }
                                    }
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun NotificationRowItem(
    notification: NotificationData,
    onClick: () -> Unit
) {
    val isUnread = !notification.isReadBool

    Surface(
        shape = RoundedCornerShape(12.dp),
        color = if (isUnread) AppColors.Forest.copy(alpha = 0.05f) else Color.White,
        border = androidx.compose.foundation.BorderStroke(
            1.dp,
            if (isUnread) AppColors.Forest.copy(alpha = 0.15f) else AppColors.Border.copy(alpha = 0.3f)
        ),
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Status Dot
            Box(
                modifier = Modifier
                    .size(10.dp)
                    .clip(CircleShape)
                    .background(if (isUnread) AppColors.Forest else Color.LightGray)
            )

            Spacer(Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = notification.pesan,
                    fontSize = 14.sp,
                    fontWeight = if (isUnread) FontWeight.Bold else FontWeight.Normal,
                    color = AppColors.TextPrimary,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    text = notification.created_at?.toReadableDate() ?: "-",
                    fontSize = 11.sp,
                    color = AppColors.Muted
                )
            }

            if (notification.report_id != null) {
                Spacer(Modifier.width(8.dp))
                Icon(
                    imageVector = Icons.Outlined.ChevronRight,
                    contentDescription = "Detail Laporan",
                    tint = AppColors.Forest,
                    modifier = Modifier.size(18.dp)
                )
            }
        }
    }
}

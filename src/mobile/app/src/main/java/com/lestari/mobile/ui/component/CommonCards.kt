package com.lestari.mobile.ui.component

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.lestari.mobile.model.ReportStatus
import com.lestari.mobile.ui.theme.AppColors

@Composable
fun SectionCard(title: String, content: @Composable ColumnScope.() -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(8.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(title, color = AppColors.ForestDark, fontWeight = FontWeight.Bold, fontSize = 18.sp)
            content()
        }
    }
}

@Composable
fun DetailRow(label: String, value: String) {
    Row {
        Text(label, color = AppColors.Muted, fontSize = 13.sp, modifier = Modifier.width(82.dp))
        Text(value, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
    }
}

@Composable
fun StatusPill(status: ReportStatus) {
    androidx.compose.foundation.layout.Box(
        modifier = Modifier
            .clip(RoundedCornerShape(18.dp))
            .background(status.background)
            .padding(horizontal = 14.dp, vertical = 6.dp)
    ) {
        Text(status.label, color = status.color, fontSize = 11.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
fun FakeReportPhoto(modifier: Modifier = Modifier) {
    Canvas(
        modifier = modifier
            .fillMaxWidth()
            .height(84.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(Color(0xFFC8D3BC))
    ) {
        drawRect(Color(0xFFB9C7AC))
        drawRect(Color(0xFF828F78), topLeft = Offset(0f, size.height * 0.62f))
        val path = Path().apply {
            moveTo(size.width * 0.08f, size.height * 0.72f)
            lineTo(size.width * 0.48f, size.height * 0.48f)
            lineTo(size.width * 0.82f, size.height * 0.66f)
        }
        drawPath(path, Color(0xFFE8E8E8), style = Stroke(width = 18f))
        drawCircle(AppColors.Danger, radius = 15f, center = Offset(size.width * 0.38f, size.height * 0.58f))
        drawCircle(Color.White, radius = 12f, center = Offset(size.width * 0.46f, size.height * 0.58f))
    }
}

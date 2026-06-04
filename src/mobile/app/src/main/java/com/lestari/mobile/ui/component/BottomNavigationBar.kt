package com.lestari.mobile.ui.component

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.lestari.mobile.model.MainTab
import com.lestari.mobile.ui.theme.AppColors

@Composable
fun BottomNavigationBar(selectedTab: MainTab, onSelect: (MainTab) -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(72.dp)
            .background(Color.White),
        horizontalArrangement = Arrangement.SpaceAround,
        verticalAlignment = Alignment.CenterVertically
    ) {
        MainTab.entries.forEach { tab ->
            val selected = selectedTab == tab
            Column(
                modifier = Modifier
                    .fillMaxHeight()
                    .weight(1f)
                    .clickable { onSelect(tab) },
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier
                        .height(5.dp)
                        .width(54.dp)
                        .background(if (selected) AppColors.Forest else Color.Transparent)
                )
                Spacer(Modifier.height(10.dp))
                Text(
                    text = tabIcon(tab),
                    color = if (selected) AppColors.Forest else AppColors.Muted,
                    fontSize = 20.sp,
                    lineHeight = 20.sp
                )
                Text(
                    text = tab.label,
                    color = if (selected) AppColors.Forest else AppColors.Muted,
                    fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
                    fontSize = 11.sp
                )
            }
        }
    }
}

private fun tabIcon(tab: MainTab): String = when (tab) {
    MainTab.Map -> "P"
    MainTab.Report -> "L"
    MainTab.History -> "R"
    MainTab.Profile -> "U"
}

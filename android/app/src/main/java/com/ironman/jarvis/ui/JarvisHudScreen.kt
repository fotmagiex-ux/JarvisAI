package com.ironman.jarvis.ui

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ironman.jarvis.model.JarvisState
import com.ironman.jarvis.model.TaskStep

@Composable
fun JarvisHudScreen(
    state: JarvisState,
    commandText: String,
    taskSteps: List<TaskStep>,
    onMicClick: () -> Unit,
    onConfirm: (Boolean) -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF070B14))
            .padding(16.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(
                modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "J.A.R.V.I.S.",
                    color = Color(0xFF00F0FF),
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 3.sp
                )
                Surface(
                    color = Color(0xFF0E1A2E),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = state.name,
                        color = Color(0xFF64FFDA),
                        fontSize = 12.sp,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            ArcReactorVisualizer(state = state)

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = if (commandText.isNotBlank()) "\"$commandText\"" else "Awaiting your voice command, sir...",
                color = Color.White,
                fontSize = 16.sp,
                fontWeight = FontWeight.Medium
            )

            Spacer(modifier = Modifier.height(20.dp))

            Text(
                text = "TASK EXECUTION SEQUENCE",
                color = Color(0xFF94A3B8),
                fontSize = 12.sp,
                letterSpacing = 1.5.sp,
                modifier = Modifier.fillMaxWidth()
            )

            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(taskSteps) { step ->
                    TaskStepItem(step = step)
                }
            }

            Box(
                modifier = Modifier
                    .size(72.dp)
                    .clip(CircleShape)
                    .background(
                        Brush.radialGradient(
                            listOf(Color(0xFF00F0FF), Color(0xFF005577))
                        )
                    )
                    .clickable { onMicClick() },
                contentAlignment = Alignment.Center
            ) {
                Text("MIC", color = Color.Black, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun ArcReactorVisualizer(state: JarvisState) {
    val infiniteTransition = rememberInfiniteTransition(label = "arc")
    val rotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(4000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "rotation"
    )

    Box(
        modifier = Modifier
            .size(140.dp)
            .border(2.dp, Color(0xFF00F0FF).copy(alpha = 0.4f), CircleShape)
            .padding(8.dp),
        contentAlignment = Alignment.Center
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .rotate(rotation)
                .border(1.5.dp, Color(0xFF00F0FF), CircleShape)
        )
        Box(
            modifier = Modifier
                .size(60.dp)
                .clip(CircleShape)
                .background(Color(0xFF00F0FF).copy(alpha = 0.25f)),
            contentAlignment = Alignment.Center
        ) {
            Box(
                modifier = Modifier
                    .size(24.dp)
                    .clip(CircleShape)
                    .background(Color(0xFF00F0FF))
            )
        }
    }
}

@Composable
fun TaskStepItem(step: TaskStep) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .background(Color(0xFF0E1A2E))
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = when (step.status) {
                com.ironman.jarvis.model.StepStatus.COMPLETED -> "✓"
                com.ironman.jarvis.model.StepStatus.ACTIVE -> "●"
                else -> "○"
            },
            color = when (step.status) {
                com.ironman.jarvis.model.StepStatus.COMPLETED -> Color(0xFF10B981)
                com.ironman.jarvis.model.StepStatus.ACTIVE -> Color(0xFF00F0FF)
                else -> Color(0xFF64748B)
            },
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(end = 12.dp)
        )
        Column {
            Text(text = step.title, color = Color.White, fontSize = 14.sp)
            if (step.titleBn.isNotBlank()) {
                Text(text = step.titleBn, color = Color(0xFF94A3B8), fontSize = 12.sp)
            }
        }
    }
}

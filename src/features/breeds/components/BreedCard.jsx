import { Card, CardContent, Typography, Chip, Divider, Stack, Box } from '@mui/material';

/**
 * Một dòng thông tin dạng "Nhãn ............ Giá trị".
 * Tách thành component nhỏ để tránh lặp code.
 */
function InfoRow({ label, value }) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between', py: 0.5 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {value}
      </Typography>
    </Stack>
  );
}

/**
 * BreedCard: hiển thị thông tin của MỘT giống chó.
 * Đây là "presentational component" - chỉ nhận props và hiển thị,
 * không biết gì về Redux.
 *
 * @param {object} breed - dữ liệu một giống chó (đã được làm phẳng trong slice)
 */
export default function BreedCard({ breed }) {
  const { name, description, life, maleWeight, femaleWeight, hypoallergenic } = breed;

  return (
    // height: '100%' -> các thẻ trên cùng một hàng cao bằng nhau
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack
          direction="row"
          sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1 }}
        >
          <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
            {name}
          </Typography>
          <Chip
            size="small"
            label={hypoallergenic ? 'Ít dị ứng' : 'Có thể gây dị ứng'}
            color={hypoallergenic ? 'success' : 'default'}
          />
        </Stack>

        {/* flexGrow: 1 -> phần mô tả co giãn, đẩy bảng thông tin xuống đáy thẻ */}
        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, mb: 2 }}>
          {description}
        </Typography>

        <Box>
          <Divider sx={{ mb: 1 }} />
          <InfoRow label="🕒 Tuổi thọ" value={`${life.min} - ${life.max} năm`} />
          <InfoRow label="♂️ Cân nặng đực" value={`${maleWeight.min} - ${maleWeight.max} kg`} />
          <InfoRow label="♀️ Cân nặng cái" value={`${femaleWeight.min} - ${femaleWeight.max} kg`} />
        </Box>
      </CardContent>
    </Card>
  );
}

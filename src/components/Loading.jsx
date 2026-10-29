import { Grid, Card, CardContent, Skeleton } from '@mui/material';

/**
 * Component dùng chung: hiển thị "khung xương" (Skeleton) trong lúc tải dữ liệu.
 * Skeleton giúp người dùng thấy trước bố cục, trải nghiệm tốt hơn vòng xoay đơn thuần.
 *
 * @param {number} count - số thẻ skeleton cần hiển thị
 */
export default function Loading({ count = 6 }) {
  return (
    <Grid container spacing={2}>
      {/* Array.from({ length: count }): tạo mảng có `count` phần tử để map */}
      {Array.from({ length: count }).map((_, index) => (
        // Cùng kích thước responsive với BreedCard để bố cục không bị "nhảy"
        <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="60%" height={36} />
              <Skeleton variant="text" />
              <Skeleton variant="text" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="rounded" height={90} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

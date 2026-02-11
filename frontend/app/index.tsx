import { Link } from 'expo-router';
import { View } from 'react-native';
const index = () => {
  return (
    <View>
      <h2>main page</h2>
      <Link href="/history">Go to Profile</Link>
    </View>
  );
};

export default index;

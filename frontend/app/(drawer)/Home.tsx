import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

function Home() {
  const { isLoaded, isSignedIn, userId, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/(auth)/register');
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#121212',
        }}
      >
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        padding: 24,
        backgroundColor: '#121212',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold', marginBottom: 16 }}>
        Welcome to AgriVision
      </Text>

      {isSignedIn ? (
        <Text style={{ color: '#1DB954', fontSize: 18, marginBottom: 32 }}>
          You are signed in as {userId?.slice(0, 8)}...
        </Text>
      ) : (
        <Text style={{ color: '#ff4d4f', fontSize: 18, marginBottom: 32 }}>Not signed in</Text>
      )}

      <TouchableOpacity
        onPress={() => router.push('/infogathering')}
        style={{
          backgroundColor: '#1DB954',
          paddingVertical: 16,
          paddingHorizontal: 32,
          borderRadius: 30,
          marginBottom: 16,
          width: '80%',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'black', fontSize: 18, fontWeight: 'bold' }}>Complete Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/infogathering')}
        style={{
          backgroundColor: '#1DB954',
          paddingVertical: 16,
          paddingHorizontal: 32,
          borderRadius: 30,
          marginBottom: 16,
          width: '80%',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'black', fontSize: 18, fontWeight: 'bold' }}>Scan Plant</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => signOut(() => router.replace('/(auth)/register'))}
        style={{ padding: 12 }}
      >
        <Text style={{ color: '#ff4d4f', fontSize: 16 }}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

export default Home;

import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

function Home() {
  const { isLoaded, isSignedIn, userId, signOut, getToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('Home loaded - Clerk status:');
    console.log('isLoaded:', isLoaded);
    console.log('isSignedIn:', isSignedIn);
    console.log('userId:', userId || 'none');

    if (isLoaded && !isSignedIn) {
      console.log('No session - redirect to auth');
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
        <Text style={{ color: 'white', marginTop: 16 }}>Loading...</Text>
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
        <Text style={{ color: '#ff4d4f', fontSize: 18, marginBottom: 32 }}>
          Not signed in - redirecting
        </Text>
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
        onPress={() => signOut(() => router.replace('/(auth)/register'))}
        style={{ padding: 12 }}
      >
        <Text style={{ color: '#ff4d4f', fontSize: 16 }}>Sign Out</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={async () => {
          try {
            const token = await getToken();
            console.log('Token length:', token ? token.length : 'NO TOKEN');

            if (!token) {
              console.log('No token - not signed in');
              return;
            }

            console.log('Sending request...');

            const res = await fetch('http://localhost:5001/api/users/me', {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            console.log('Status code:', res.status);

            if (!res.ok) {
              const text = await res.text();
              console.log('Error response:', text);
              return;
            }

            const data = await res.json();
            console.log('Success - user data:', data);
          } catch (err) {
            console.log('Fetch error:', err.message);
          }
        }}
        style={{ backgroundColor: '#333', padding: 16, borderRadius: 12, marginTop: 20 }}
      >
        <Text style={{ color: 'white' }}>Test Backend Call</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={async () => {
          try {
            const token = await getToken();
            if (!token) {
              console.log('No token');
              return;
            }

            const res = await fetch('http://localhost:5001/api/debug/users', {
              headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            console.log('All users from DB:', data);
          } catch (err) {
            console.log('Error:', err.message);
          }
        }}
        style={{ backgroundColor: '#555', padding: 16, borderRadius: 12, marginTop: 20 }}
      >
        <Text style={{ color: 'white' }}>Show All Users from DB</Text>
      </TouchableOpacity>
    </View>
  );
}

export default Home;

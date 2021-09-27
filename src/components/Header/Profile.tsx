import { Flex, Text, Box, Avatar } from '@chakra-ui/react'
import { useAuth } from '../../hooks/useAuth'

interface ProfileProps {
  showProfileData?: boolean;
}

export function Profile({ showProfileData = true }: ProfileProps) {
  const { user } = useAuth()

  return (
    <Flex align="center">
      {showProfileData && (
        <Box mr="4" textAlign="center">
          <Text color="gray.300" fontSize="small">{user?.email}</Text>
        </Box>
      )}
      
      <Avatar size="md" name={user?.email} />
    </Flex>
  )
}
